const map = {
  Pending:    { bg: 'rgba(255,184,0,0.15)',   color: '#E6A500' },
  Confirmed:  { bg: 'rgba(78,205,196,0.15)',  color: '#4ECDC4' },
  Completed:  { bg: 'rgba(46,213,115,0.15)',  color: '#2ED573' },
  Cancelled:  { bg: 'rgba(255,71,87,0.15)',   color: '#FF4757' },
  Assigned:   { bg: 'rgba(108,99,255,0.15)',  color: '#6C63FF' },
  'En Route': { bg: 'rgba(78,205,196,0.15)',  color: '#4ECDC4' },
  Arrived:    { bg: 'rgba(46,213,115,0.15)',  color: '#2ED573' },
  Requested:  { bg: 'rgba(255,184,0,0.15)',   color: '#E6A500' },
};

export default function StatusBadge({ status }) {
  const s = map[status] || { bg: 'rgba(156,163,175,0.15)', color: '#9CA3AF' };
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs"
      style={{ background: s.bg, color: s.color, fontWeight: 600 }}
    >
      {status}
    </span>
  );
}
