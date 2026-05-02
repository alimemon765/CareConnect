import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';

const roleStyle = {
  patient:   { bg: 'rgba(78,205,196,0.12)',  color: '#4ECDC4' },
  doctor:    { bg: 'rgba(255,184,0,0.12)',   color: '#FFB800' },
  admin:     { bg: 'rgba(108,99,255,0.12)',  color: '#6C63FF' },
  ambulance: { bg: 'rgba(255,71,87,0.12)',   color: '#FF4757' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/admin/users`)
      .then((r) => setUsers(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/users/${id}`);
      toast.success('User deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <Layout title="All Users">
      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {users.map((u, i) => {
            const rs = roleStyle[u.role] || { bg: 'rgba(156,163,175,0.12)', color: '#9CA3AF' };
            return (
              <motion.div key={u._id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 bg-card rounded-2xl p-4"
                style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: rs.bg }}>
                  <span className="text-sm" style={{ color: rs.color, fontWeight: 700 }}>{u.name?.[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-main truncate" style={{ fontWeight: 700 }}>{u.name}</p>
                  <p className="text-xs text-text-muted truncate">{u.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full capitalize" style={{ background: rs.bg, color: rs.color, fontWeight: 600 }}>
                      {u.role}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {u.role !== 'admin' && (
                  <button onClick={() => deleteUser(u._id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#F1F3F5', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                    <Trash2 size={15} />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
