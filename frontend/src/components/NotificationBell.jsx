import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const { user, socket } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const unread = notifications.filter((n) => !n.isRead).length;

  const fetch_ = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/notifications`)
      .then((r) => setNotifications(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    if (!user) return;
    fetch_();
    const poll = setInterval(fetch_, 30000);
    if (socket) {
      socket.on('notification:new', (payload) => {
        setNotifications((prev) => [
          { ...payload, _id: Date.now().toString(), isRead: false, createdAt: new Date() },
          ...prev,
        ]);
      });
    }
    return () => { clearInterval(poll); socket?.off('notification:new'); };
  }, [user, socket]);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const markOne = async (id) => {
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    await axios.put(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`).catch(() => {});
  };

  const markAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await axios.put(`${import.meta.env.VITE_API_URL}/notifications/read-all`).catch(() => {});
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl hover:bg-input transition-colors"
        aria-label="Notifications"
      >
        <Bell size={22} color="#1A1A2E" strokeWidth={1.8} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-72 bg-card rounded-2xl z-50 overflow-hidden"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)', border: '1px solid #E5E7EB' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-700 text-text-main" style={{ fontWeight: 700 }}>
                Notifications
              </span>
              {unread > 0 && (
                <button onClick={markAll} className="text-xs font-600 text-yellow" style={{ fontWeight: 600 }}>
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-border">
              {notifications.length === 0 && (
                <p className="text-sm text-text-muted text-center py-8">No notifications</p>
              )}
              {notifications.slice(0, 10).map((n) => (
                <div
                  key={n._id}
                  onClick={() => markOne(n._id)}
                  className={`px-4 py-3 cursor-pointer hover:bg-bg transition-colors border-l-4 ${
                    n.type === 'emergency' ? 'border-danger' : 'border-teal'
                  } ${n.isRead ? 'opacity-50' : ''}`}
                >
                  <p className="text-xs font-600 text-text-main" style={{ fontWeight: 600 }}>{n.title}</p>
                  <p className="text-xs text-text-sub mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-text-muted mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
