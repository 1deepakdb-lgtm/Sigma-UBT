import sqlite3
import os
import sys
import shutil
import subprocess

def log(msg):
    print(f"[REPAIR] {msg}")
    sys.stdout.flush()

def check_db_health(db_path):
    try:
        con = sqlite3.connect(db_path)
        cur = con.cursor()
        res = cur.execute("PRAGMA integrity_check;").fetchall()
        # Also test querying ExamSet and User
        cur.execute("SELECT count(*) FROM User;")
        cur.execute("SELECT count(*) FROM ExamSet;")
        con.close()
        return res == [('ok',)]
    except Exception as e:
        log(f"Health check failed: {e}")
        return False

def rebuild_with_prisma(repo_dir, db_path):
    rebuilt_path = os.path.join(repo_dir, 'prisma', 'dev_rebuilt.db')
    if os.path.exists(rebuilt_path):
        try: os.remove(rebuilt_path)
        except: pass

    # Step 1: Run Prisma db push to generate perfect clean schema
    log("Creating fresh schema via Prisma db push...")
    prisma_cli = os.path.join(repo_dir, 'node_modules', 'prisma', 'build', 'index.js')
    if not os.path.exists(prisma_cli):
        log(f"Prisma CLI not found at {prisma_cli}")
        return False

    env = dict(os.environ)
    env['DATABASE_URL'] = f"file:{rebuilt_path}"
    
    cmd = ['node', prisma_cli, 'db', 'push', '--skip-generate', '--accept-data-loss']
    res = subprocess.run(cmd, cwd=repo_dir, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        log(f"Prisma db push failed: {res.stderr or res.stdout}")
        return False
    log("Fresh schema created successfully with Prisma.")

    # Step 2: Copy intact table data from old db to rebuilt db
    if os.path.exists(db_path):
        log("Migrating intact data from old database to clean rebuilt database...")
        try:
            src = sqlite3.connect(db_path)
            dst = sqlite3.connect(rebuilt_path)
            # Disable foreign key checks during migration
            dst.execute("PRAGMA foreign_keys = OFF;")

            # Get tables in rebuilt db
            tables = [r[0] for r in dst.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'").fetchall()]
            
            for tbl in tables:
                log(f"Migrating table: {tbl}...")
                # Check if src has this table
                src_check = src.execute(f"SELECT count(*) FROM sqlite_master WHERE type='table' AND name='{tbl}'").fetchone()
                if not src_check or src_check[0] == 0:
                    continue

                try:
                    # Get column list of dst
                    dst_cols = [c[1] for c in dst.execute(f"PRAGMA table_info('{tbl}')").fetchall()]
                    # Get column list of src
                    src_cols = [c[1] for c in src.execute(f"PRAGMA table_info('{tbl}')").fetchall()]
                    common_cols = [c for c in dst_cols if c in src_cols]
                    
                    if not common_cols:
                        continue

                    col_str = ', '.join([f'"{c}"' for c in common_cols])
                    placeholders = ', '.join(['?'] * len(common_cols))
                    insert_sql = f'INSERT OR IGNORE INTO "{tbl}" ({col_str}) VALUES ({placeholders})'

                    try:
                        rows = src.execute(f'SELECT {col_str} FROM "{tbl}"').fetchall()
                        if rows:
                            dst.executemany(insert_sql, rows)
                            dst.commit()
                            log(f"  -> Migrated {len(rows)} rows for {tbl}.")
                    except Exception as batch_err:
                        log(f"  -> Batch copy failed for {tbl} ({batch_err}), copying row by row...")
                        cur_src = src.cursor()
                        cur_src.execute(f'SELECT {col_str} FROM "{tbl}"')
                        count = 0
                        while True:
                            try:
                                r = cur_src.fetchone()
                                if r is None:
                                    break
                                dst.execute(insert_sql, r)
                                count += 1
                            except Exception:
                                continue
                        dst.commit()
                        log(f"  -> Salvaged {count} individual rows for {tbl}.")
                except Exception as tbl_err:
                    log(f"  -> Table migration error for {tbl}: {tbl_err}")

            # Re-enable foreign keys
            dst.execute("PRAGMA foreign_keys = ON;")
            dst.commit()
            src.close()
            dst.close()

        except Exception as mig_err:
            log(f"Data migration notice: {mig_err}")

    # Step 3: Ensure Free demo sets are set
    try:
        con_dst = sqlite3.connect(rebuilt_path)
        cur_dst = con_dst.cursor()
        cur_dst.execute("UPDATE ExamSet SET isFree = 1 WHERE name LIKE '%Chapterwise 01%' OR name LIKE '%SET 01%' OR name LIKE '%SET 1%'")
        con_dst.commit()
        con_dst.close()
        log("Verified isFree demo sets.")
    except Exception as fe:
        log(f"isFree update notice: {fe}")

    # Step 4: Validate rebuilt db health
    if check_db_health(rebuilt_path):
        log("Rebuilt database passed all integrity and query health checks!")
        # Backup old
        if os.path.exists(db_path):
            backup_path = db_path + ".malformed_backup"
            try:
                shutil.copy2(db_path, backup_path)
                log(f"Backed up corrupt db to {backup_path}")
            except: pass
        # Replace
        shutil.copy2(rebuilt_path, db_path)
        log("Successfully replaced dev.db with pristine rebuilt database!")
        try: os.remove(rebuilt_path)
        except: pass
        return True
    else:
        log("Rebuilt database failed health check.")
        return False

def main():
    repo_dir = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()
    db_path = os.path.join(repo_dir, 'prisma', 'dev.db')
    log(f"Starting database repair on: {db_path}")

    if check_db_health(db_path):
        log("Database is already healthy. Ensuring isFree flags are set...")
        try:
            con = sqlite3.connect(db_path)
            cur = con.cursor()
            cur.execute("UPDATE ExamSet SET isFree = 1 WHERE name LIKE '%Chapterwise 01%' OR name LIKE '%SET 01%' OR name LIKE '%SET 1%'")
            con.commit()
            con.close()
            log("isFree flags verified.")
        except: pass
        return True

    log("Database failed health check. Rebuilding schema via Prisma and salvaging data...")
    return rebuild_with_prisma(repo_dir, db_path)

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
