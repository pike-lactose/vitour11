import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Shield, User, RefreshCw, Eye, EyeOff } from 'lucide-react';
import './ManageUsers.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newRole, setNewRole] = useState('admin');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!newUsername.trim() || !newPassword.trim()) {
      setError('Username dan password wajib diisi');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
          role: newRole
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat user');
      }

      setSuccessMsg(`User "${data.user.username}" berhasil dibuat`);
      setNewUsername('');
      setNewPassword('');
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Hapus user "${username}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus user');
      }

      setSuccessMsg(`User "${username}" berhasil dihapus`);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="manage-users">
      <div className="manage-users-header">
        <div>
          <h1 className="manage-users-title">Kelola Admin</h1>
          <p className="manage-users-subtitle">Tambah atau hapus akun admin</p>
        </div>
        <button
          className="add-user-btn"
          onClick={() => {
            setShowForm(!showForm);
            setError('');
            setSuccessMsg('');
          }}
        >
          <UserPlus size={18} />
          {showForm ? 'Batal' : 'Tambah Admin'}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            className="manage-users-alert manage-users-alert-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            className="manage-users-alert manage-users-alert-success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.form
            className="create-user-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateUser}
          >
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Username</label>
                <div className="input-icon-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Masukkan username"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-icon-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                  />
                  <button
                    type="button"
                    className="input-icon-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <div className="input-icon-wrapper">
                  <Shield size={16} className="input-icon" />
                  <select
                    className="form-input form-select"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>
              </div>
            </div>
            <button type="submit" className="submit-user-btn">
              <UserPlus size={16} />
              Buat Akun
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="users-list">
        <div className="users-list-header">
          <span>Daftar Admin</span>
          <button className="refresh-btn" onClick={fetchUsers}>
            <RefreshCw size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="users-loading">
            <div className="spinner"></div>
            <p>Memuat...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="users-empty">Tidak ada user ditemukan</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td className="username-cell">{user.username}</td>
                  <td>
                    <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-editor'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <button
                      className="delete-user-btn"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      title="Hapus user"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
