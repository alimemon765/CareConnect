import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Upload, FileText, Download, FilePlus } from 'lucide-react';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';

const inputStyle = {
  background: '#F1F3F5', borderRadius: 14, height: 48, border: 'none',
  width: '100%', padding: '0 16px', fontSize: 14, color: '#1A1A2E', fontFamily: 'Inter, sans-serif',
};

export default function PatientRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const fileRef = useRef();

  const load = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/patient/records`)
      .then((r) => setRecords(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files[0];
    if (!file) return toast.error('Select a file first');
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        await axios.post(`${import.meta.env.VITE_API_URL}/patient/records`, {
          fileName: file.name,
          fileType: file.type,
          base64Data: reader.result,
          description,
        });
        toast.success('Record uploaded');
        fileRef.current.value = '';
        setSelectedName('');
        setDescription('');
        load();
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout title="Medical Records">
      {/* Upload card */}
      <div className="bg-card rounded-2xl p-5 mb-5" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <p className="text-xs text-text-muted mb-3" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Upload Record
        </p>
        <form onSubmit={handleUpload} className="space-y-3">
          <label
            className="flex flex-col items-center justify-center rounded-xl py-6 cursor-pointer"
            style={{ border: '2px dashed #E5E7EB', background: selectedName ? 'rgba(78,205,196,0.05)' : 'transparent' }}
          >
            <Upload size={24} color={selectedName ? '#4ECDC4' : '#9CA3AF'} style={{ marginBottom: 8 }} />
            <span className="text-sm" style={{ color: selectedName ? '#4ECDC4' : '#9CA3AF', fontWeight: 600 }}>
              {selectedName || 'Tap to select file'}
            </span>
            <input
              type="file"
              ref={fileRef}
              className="hidden"
              onChange={(e) => setSelectedName(e.target.files[0]?.name || '')}
            />
          </label>
          <input
            type="text"
            placeholder="Description (optional)"
            style={inputStyle}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            disabled={uploading}
            style={{
              width: '100%', height: 48, borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#4ECDC4,#44B8B0)',
              color: '#fff', fontWeight: 600, fontSize: 14, opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? 'Uploading…' : 'Upload Record'}
          </motion.button>
        </form>
      </div>

      {/* Records list */}
      <p className="text-xs text-text-muted mb-3" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Your Records
      </p>
      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {records.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-text-muted">
              <FilePlus size={48} strokeWidth={1.5} />
              <p className="text-sm mt-3">No records yet</p>
            </div>
          )}
          {records.map((r, i) => (
            <motion.div key={r._id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 bg-card rounded-2xl p-4"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(78,205,196,0.12)' }}>
                <FileText size={18} color="#4ECDC4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-main truncate" style={{ fontWeight: 700 }}>
                  {r.description || r.fileName}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {new Date(r.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              {r.base64Data && (
                <a href={r.base64Data} download={r.fileName}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: '#F1F3F5' }}>
                  <Download size={15} color="#6B7280" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
