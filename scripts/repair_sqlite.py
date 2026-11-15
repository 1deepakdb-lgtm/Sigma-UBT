import sqlite3
import os
import sys
import shutil

def repair_database(db_path):
    print(f"[*] Checking database: {db_path}")
    if not os.path.exists(db_path):
        print(f"[-] Database file does not exist: {db_path}")
        return False

    # 1. Quick integrity check
    try:
        con = sqlite3.connect(db_path)
        cur = con.cursor()
        check = cur.execute("PRAGMA integrity_check;").fetchall()
        print(f"[*] Initial integrity check: {check}")
        if check == [('ok',)]:
            print("[+] Database is already healthy and clean.")
            # Ensure isFree values are up to date
            try:
                cur.execute("UPDATE ExamSet SET isFree = 1 WHERE name LIKE '%Chapterwise 01%' OR name LIKE '%SET 01%' OR name LIKE '%SET 1%'")
                con.commit()
                print("[+] Verified isFree for demo sets.")
            except Exception as ue:
                print(f"[-] Note on isFree update: {ue}")
            con.close()
            return True
    except Exception as e:
        print(f"[!] Integrity check raised exception: {e}")

    # 2. Try REINDEX first
    print("[*] Attempting in-place REINDEX...")
    try:
        cur.execute("REINDEX;")
        con.commit()
        check = cur.execute("PRAGMA integrity_check;").fetchall()
        print(f"[*] Integrity check after REINDEX: {check}")
        if check == [('ok',)]:
            print("[+] REINDEX successfully repaired the database!")
            con.close()
            return True
    except Exception as reindex_err:
        print(f"[!] REINDEX failed: {reindex_err}")
    finally:
        try:
            con.close()
        except Exception:
            pass

    # 3. Row-by-Row Salvage & Index Rebuild
    print("[*] Starting row-by-row table salvage...")
    backup_path = db_path + ".malformed_backup"
    try:
        shutil.copy2(db_path, backup_path)
        print(f"[+] Backed up original to {backup_path}")
    except Exception as be:
        print(f"[!] Backup warning: {be}")

    recovered_path = db_path + ".recovered"
    if os.path.exists(recovered_path):
        try:
            os.remove(recovered_path)
        except Exception:
            pass

    try:
        src = sqlite3.connect(db_path)
        dst = sqlite3.connect(recovered_path)

        # Get schemas
        schemas = src.execute(
            "SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%'"
        ).fetchall()

        # Step A: Create Tables
        for stype, sname, ssql in schemas:
            if stype == 'table':
                try:
                    dst.execute(ssql)
                except Exception as te:
                    print(f"[-] Could not create table {sname}: {te}")
        dst.commit()

        # Step B: Copy Data Table by Table
        for stype, sname, ssql in schemas:
            if stype == 'table':
                print(f"[*] Copying data for table: {sname}...")
                try:
                    rows = src.execute(f'SELECT * FROM "{sname}"').fetchall()
                    if rows:
                        placeholders = ','.join(['?'] * len(rows[0]))
                        dst.executemany(f'INSERT OR IGNORE INTO "{sname}" VALUES ({placeholders})', rows)
                        dst.commit()
                        print(f"  [+] Copied {len(rows)} rows cleanly for {sname}.")
                except Exception as batch_err:
                    print(f"  [!] Batch read failed for {sname} ({batch_err}), trying individual rows...")
                    try:
                        cur_src = src.cursor()
                        cur_src.execute(f'SELECT * FROM "{sname}"')
                        copied = 0
                        while True:
                            try:
                                r = cur_src.fetchone()
                                if r is None:
                                    break
                                placeholders = ','.join(['?'] * len(r))
                                dst.execute(f'INSERT OR IGNORE INTO "{sname}" VALUES ({placeholders})', r)
                                copied += 1
                            except Exception:
                                continue
                        dst.commit()
                        print(f"  [+] Salvaged {copied} individual rows for {sname}.")
                    except Exception as row_err:
                        print(f"  [!] Individual row salvage failed for {sname}: {row_err}")

        # Step C: Recreate Indexes cleanly
        for stype, sname, ssql in schemas:
            if stype == 'index':
                try:
                    dst.execute(ssql)
                except Exception as ie:
                    print(f"[-] Index recreation notice for {sname}: {ie}")
        dst.commit()

        # Step D: Test recovered DB integrity
        cur_dst = dst.cursor()
        test_check = cur_dst.execute("PRAGMA integrity_check;").fetchall()
        print(f"[*] Recovered database integrity check: {test_check}")

        # Ensure demo sets are free
        try:
            cur_dst.execute("UPDATE ExamSet SET isFree = 1 WHERE name LIKE '%Chapterwise 01%' OR name LIKE '%SET 01%' OR name LIKE '%SET 1%'")
            dst.commit()
            print("[+] Verified isFree in recovered database.")
        except Exception as fe:
            print(f"[-] isFree update notice: {fe}")

        src.close()
        dst.close()

        if test_check == [('ok',)]:
            shutil.copy2(recovered_path, db_path)
            print("[+] Successfully replaced corrupted dev.db with repaired dev.db!")
            return True
        else:
            print("[!] Recovered DB check did not return ok.")
            return False

    except Exception as salv_err:
        print(f"[!] Salvage encountered fatal error: {salv_err}")
        return False

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else 'prisma/dev.db'
    success = repair_database(target)
    sys.exit(0 if success else 1)
