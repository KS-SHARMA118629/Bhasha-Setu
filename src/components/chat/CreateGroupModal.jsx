import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Camera, X, Users, Loader } from 'lucide-react';

const CreateGroupModal = ({ session, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      let avatarUrl = null;
      if (file) {
        const path = `groups/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('chat-media').upload(path, file);
        if (!uploadError) {
          const { data } = supabase.storage.from('chat-media').getPublicUrl(path);
          avatarUrl = data.publicUrl;
        }
      }

      // 1. Create conversation with is_group: true
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .insert({
          is_group: true,
          name: name.trim(),
          description: description.trim(),
          avatar_url: avatarUrl,
          created_by: session.user.id
        })
        .select()
        .single();

      if (convError) throw convError;

      // 2. Add creator as admin
      const { error: memberError } = await supabase
        .from('conversation_members')
        .insert({
          conversation_id: conv.id,
          user_id: session.user.id,
          role: 'admin',
          is_admin: true
        });

      if (memberError) throw memberError;

      onCreated?.();
    } catch (err) {
      console.error('Error creating group:', err);
      alert('Failed to create group. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 400 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
            <Users size={24} color="var(--primary)" />
            Create Group
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div
              style={{
                width: 100, height: 100, borderRadius: '50%', background: 'var(--bg-color-alt)',
                border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', position: 'relative', cursor: 'pointer'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Camera size={32} color="var(--text-muted)" />
              )}
              <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.75rem', textAlign: 'center', padding: '2px 0' }}>
                Upload
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" style={{ display: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 5 }}>Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g., Hindi Learners"
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)', fontFamily: 'var(--font-base)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 5 }}>Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              rows={3}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)', fontFamily: 'var(--font-base)', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !name.trim()}>
              {loading ? <Loader className="spin" size={20} /> : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
