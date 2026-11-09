'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

/**
 * AdminSettings — Super Admin Account & Security Management
 *
 * Provides two panels:
 *  1. Profile Update — name, phone, username (all require current password)
 *  2. Password Change — old password + new password + confirm (API-backed, bcrypt)
 *
 * All changes go through /api/admin/superadmin (admin-only, JWT-guarded).
 * NO localStorage is used for any sensitive data.
 */
export default function AdminSettings() {
  // ── Current admin profile ────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ── Profile form ─────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({ newName: '', newPhone: '', newUsername: '', currentPassword: '' });
  const [profileMsg, setProfileMsg] = useState({ text: '', isError: false });
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Password form ────────────────────────────────────────────────────────
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [passMsg, setPassMsg] = useState({ text: '', isError: false });
  const [savingPass, setSavingPass] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // ── Active tab ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('profile');

  // ── Git & cPanel Sync state ──────────────────────────────────────────────
  const [gitSyncing, setGitSyncing] = useState(false);
  const [gitLogs, setGitLogs] = useState([]);
  const [latestCommit, setLatestCommit] = useState('');
  const [gitError, setGitError] = useState('');

  // Load current admin profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/admin/superadmin');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setProfileForm((f) => ({
            ...f,
            newName: data.user.name || '',
            newPhone: data.user.phone || '',
            newUsername: data.user.username || '',
          }));
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, []);

  // ── Profile update handler ───────────────────────────────────────────────
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', isError: false });

    if (!profileForm.currentPassword) {
      setProfileMsg({ text: 'Current password is required to save changes.', isError: true });
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch('/api/admin/superadmin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: profileForm.currentPassword,
          newName: profileForm.newName,
          newPhone: profileForm.newPhone,
          newUsername: profileForm.newUsername,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ text: data.error || 'Update failed.', isError: true });
      } else {
        setProfile(data.user);
        setProfileMsg({ text: '✅ Profile updated successfully!', isError: false });
        setProfileForm((f) => ({ ...f, currentPassword: '' }));
      }
    } catch (err) {
      setProfileMsg({ text: 'Network error. Please try again.', isError: true });
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Password change handler ──────────────────────────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', isError: false });

    if (!passForm.currentPassword || !passForm.newPassword || !passForm.confirmNewPassword) {
      setPassMsg({ text: 'All password fields are required.', isError: true });
      return;
    }
    if (passForm.newPassword.length < 8) {
      setPassMsg({ text: 'New password must be at least 8 characters long.', isError: true });
      return;
    }
    if (passForm.newPassword !== passForm.confirmNewPassword) {
      setPassMsg({ text: 'New passwords do not match.', isError: true });
      return;
    }

    setSavingPass(true);
    try {
      const res = await fetch('/api/admin/superadmin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword,
          confirmNewPassword: passForm.confirmNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPassMsg({ text: data.error || 'Password change failed.', isError: true });
      } else {
        setPassMsg({ text: '🔐 Password changed successfully! Your session has been refreshed.', isError: false });
        setPassForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      }
    } catch (err) {
      setPassMsg({ text: 'Network error. Please try again.', isError: true });
    } finally {
      setSavingPass(false);
    }
  };

  // ── Git & cPanel Sync handler ────────────────────────────────────────────
  const handleGitSync = async () => {
    setGitSyncing(true);
    setGitError('');
    try {
      const res = await fetch('/api/webhook/deploy?format=json');
      const data = await res.json();
      if (data.success) {
        setGitLogs(data.logs || []);
        setLatestCommit(data.latestCommit || '');
      } else {
        setGitError(data.error || 'Deployment failed');
      }
    } catch (err) {
      setGitError(err.message || 'Network error triggering deployment');
    } finally {
      setGitSyncing(false);
    }
  };

  // ─── Styles ──────────────────────────────────────────────────────────────
  const s = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    },
    content: {
      maxWidth: '640px',
      margin: '0 auto',
      padding: '32px 20px',
    },
    heading: { fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' },
    sub: { fontSize: '14px', color: '#64748b', marginBottom: '24px' },
    tabs: { display: 'flex', gap: '8px', marginBottom: '24px' },
    tab: (active) => ({
      padding: '9px 18px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      backgroundColor: active ? '#2563eb' : '#e2e8f0',
      color: active ? '#fff' : '#475569',
      transition: 'all 0.15s',
    }),
    card: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
      padding: '28px',
    },
    cardTitle: { fontSize: '17px', fontWeight: '700', color: '#1e293b', marginTop: 0, marginBottom: '20px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' },
    input: {
      width: '100%',
      padding: '11px 14px',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      boxSizing: 'border-box',
      outline: 'none',
    },
    passWrap: { position: 'relative' },
    eyeBtn: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      color: '#94a3b8',
    },
    formGroup: { marginBottom: '18px' },
    btn: (disabled) => ({
      width: '100%',
      padding: '12px',
      backgroundColor: disabled ? '#94a3b8' : '#2563eb',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '700',
      fontSize: '15px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      marginTop: '6px',
      transition: 'background 0.15s',
    }),
    alert: (isError) => ({
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '18px',
      backgroundColor: isError ? '#fef2f2' : '#f0fdf4',
      color: isError ? '#b91c1c' : '#166534',
      border: `1px solid ${isError ? '#fecaca' : '#bbf7d0'}`,
    }),
    profileBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '14px 18px',
      marginBottom: '24px',
    },
    avatar: {
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      backgroundColor: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: '700',
      fontSize: '18px',
      flexShrink: 0,
    },
    profileName: { fontWeight: '700', color: '#0f172a', fontSize: '15px' },
    profileRole: { color: '#64748b', fontSize: '13px', marginTop: '2px' },
    divider: { height: '1px', backgroundColor: '#e2e8f0', margin: '20px 0' },
    hint: { fontSize: '12px', color: '#94a3b8', marginTop: '4px' },
    strengthBar: (pct, color) => ({
      height: '4px',
      width: `${pct}%`,
      backgroundColor: color,
      borderRadius: '4px',
      transition: 'width 0.3s, background 0.3s',
    }),
    strengthWrap: { backgroundColor: '#e2e8f0', borderRadius: '4px', height: '4px', marginTop: '8px' },
    securityNote: {
      backgroundColor: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: '8px',
      padding: '12px 14px',
      fontSize: '13px',
      color: '#1d4ed8',
      marginBottom: '20px',
    },
  };

  // Password strength meter
  const getStrength = (pw) => {
    if (!pw) return { pct: 0, color: '#e2e8f0', label: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const colors = ['#e2e8f0', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
    return { pct: (score / 5) * 100, color: colors[score], label: labels[score] };
  };

  const strength = getStrength(passForm.newPassword);

  return (
    <div style={s.page}>
      <Navbar role="admin" />
      <div style={s.content}>
        <h2 style={s.heading}>🔒 Security & Account Settings</h2>
        <p style={s.sub}>Manage super-admin credentials. All changes require current password verification.</p>

        {/* Profile badge */}
        {!loadingProfile && profile && (
          <div style={s.profileBadge}>
            <div style={s.avatar}>{(profile.name || 'A')[0].toUpperCase()}</div>
            <div>
              <div style={s.profileName}>{profile.name}</div>
              <div style={s.profileRole}>@{profile.username} · Super Administrator</div>
            </div>
          </div>
        )}

        {/* Tab navigation */}
        <div style={s.tabs}>
          <button style={s.tab(activeTab === 'profile')} onClick={() => setActiveTab('profile')}>
            👤 Profile
          </button>
          <button style={s.tab(activeTab === 'password')} onClick={() => setActiveTab('password')}>
            🔑 Change Password
          </button>
          <button style={s.tab(activeTab === 'git')} onClick={() => setActiveTab('git')}>
            🚀 Git & cPanel Sync
          </button>
        </div>

        {/* ── Profile Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>Update Profile Information</h3>

            <div style={s.securityNote}>
              🛡️ Current password is required to save any profile changes.
            </div>

            {profileMsg.text && (
              <div style={s.alert(profileMsg.isError)}>{profileMsg.text}</div>
            )}

            <form onSubmit={handleProfileSave} autoComplete="off">
              <div style={s.formGroup}>
                <label style={s.label}>Display Name</label>
                <input
                  id="admin-name"
                  style={s.input}
                  type="text"
                  value={profileForm.newName}
                  onChange={(e) => setProfileForm({ ...profileForm, newName: e.target.value })}
                  placeholder="Full name"
                  autoComplete="off"
                />
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Phone Number</label>
                <input
                  id="admin-phone"
                  style={s.input}
                  type="tel"
                  value={profileForm.newPhone}
                  onChange={(e) => setProfileForm({ ...profileForm, newPhone: e.target.value })}
                  placeholder="Phone (optional)"
                  autoComplete="off"
                />
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Login Username</label>
                <input
                  id="admin-username"
                  style={s.input}
                  type="text"
                  value={profileForm.newUsername}
                  onChange={(e) => setProfileForm({ ...profileForm, newUsername: e.target.value })}
                  placeholder="Login username"
                  autoComplete="off"
                />
                <div style={s.hint}>Changing username will require you to log in with the new username next time.</div>
              </div>

              <div style={s.divider} />

              <div style={s.formGroup}>
                <label style={s.label}>🔐 Current Password (required)</label>
                <div style={s.passWrap}>
                  <input
                    id="admin-current-pass-profile"
                    style={{ ...s.input, paddingRight: '44px' }}
                    type={showCurrentPass ? 'text' : 'password'}
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    style={s.eyeBtn}
                    onClick={() => setShowCurrentPass((v) => !v)}
                    tabIndex={-1}
                  >
                    {showCurrentPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button id="save-profile-btn" type="submit" style={s.btn(savingProfile)} disabled={savingProfile}>
                {savingProfile ? 'Saving...' : '💾 Save Profile Changes'}
              </button>
            </form>
          </div>
        )}

        {/* ── Password Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'password' && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>Change Password</h3>

            <div style={s.securityNote}>
              🛡️ Passwords are hashed with bcrypt. Never stored in plain text. Changing password refreshes your session automatically.
            </div>

            {passMsg.text && (
              <div style={s.alert(passMsg.isError)}>{passMsg.text}</div>
            )}

            <form onSubmit={handlePasswordChange} autoComplete="off">
              <div style={s.formGroup}>
                <label style={s.label}>Current Password</label>
                <div style={s.passWrap}>
                  <input
                    id="admin-current-password"
                    style={{ ...s.input, paddingRight: '44px' }}
                    type={showCurrentPass ? 'text' : 'password'}
                    value={passForm.currentPassword}
                    onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                    placeholder="Your current password"
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowCurrentPass((v) => !v)} tabIndex={-1}>
                    {showCurrentPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>New Password</label>
                <div style={s.passWrap}>
                  <input
                    id="admin-new-password"
                    style={{ ...s.input, paddingRight: '44px' }}
                    type={showNewPass ? 'text' : 'password'}
                    value={passForm.newPassword}
                    onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowNewPass((v) => !v)} tabIndex={-1}>
                    {showNewPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {passForm.newPassword && (
                  <>
                    <div style={s.strengthWrap}>
                      <div style={s.strengthBar(strength.pct, strength.color)} />
                    </div>
                    <div style={{ ...s.hint, color: strength.color }}>
                      {strength.label}
                    </div>
                  </>
                )}
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Confirm New Password</label>
                <input
                  id="admin-confirm-password"
                  style={{
                    ...s.input,
                    border: passForm.confirmNewPassword && passForm.newPassword !== passForm.confirmNewPassword
                      ? '1.5px solid #ef4444'
                      : '1px solid #cbd5e1',
                  }}
                  type="password"
                  value={passForm.confirmNewPassword}
                  onChange={(e) => setPassForm({ ...passForm, confirmNewPassword: e.target.value })}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  required
                />
                {passForm.confirmNewPassword && passForm.newPassword !== passForm.confirmNewPassword && (
                  <div style={{ ...s.hint, color: '#ef4444' }}>Passwords do not match</div>
                )}
              </div>

              <button id="change-password-btn" type="submit" style={s.btn(savingPass)} disabled={savingPass}>
                {savingPass ? 'Updating...' : '🔐 Change Password'}
              </button>
            </form>
          </div>
        )}

        {/* ── Git & cPanel Live Sync Tab ────────────────────────────────── */}
        {activeTab === 'git' && (
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ ...s.cardTitle, margin: 0 }}>🚀 Git to cPanel Real-Time Sync</h3>
              <span style={{ fontSize: '12px', background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>
                Production
              </span>
            </div>

            <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '20px', lineHeight: '1.6' }}>
              Pull the latest code and pre-compiled Next.js production builds directly from GitHub into cPanel and automatically reload Phusion Passenger in real time.
            </p>

            {gitError && (
              <div style={s.alert(true)}>⚠️ {gitError}</div>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <button
                type="button"
                onClick={handleGitSync}
                disabled={gitSyncing}
                style={{
                  padding: '11px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  background: gitSyncing ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: gitSyncing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {gitSyncing ? '🔄 Syncing Git to cPanel...' : '⚡ Pull Latest from Git & Restart'}
              </button>

              <a
                href="/api/webhook/deploy?key=examjk_deploy_2026"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '11px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: '600',
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                🖥️ Open Live Terminal Output
              </a>
            </div>

            {latestCommit && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#065f46' }}>
                <strong>Active Deployed Commit:</strong> {latestCommit}
              </div>
            )}

            {gitLogs.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>
                  Real-Time Execution Logs:
                </div>
                <div style={{
                  background: '#030712',
                  color: '#34d399',
                  borderRadius: '8px',
                  padding: '16px',
                  fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '12.5px',
                  lineHeight: '1.6',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  border: '1px solid #1f2937'
                }}>
                  {gitLogs.map((log, i) => (
                    <div key={i} style={{ margin: '3px 0' }}>{log}</div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', fontSize: '13px', color: '#475569' }}>
              <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                🔗 Auto-Deploy via GitHub Webhook:
              </div>
              <div style={{ marginBottom: '6px' }}>
                In your GitHub repo (<code>1deepakdb-lgtm/sigma-ubt</code>) &rarr; Settings &rarr; Webhooks:
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' }}>
                https://examjk.com/api/webhook/deploy?key=examjk_deploy_2026
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                Content type: <code>application/json</code> | Trigger: <code>Just the push event</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}