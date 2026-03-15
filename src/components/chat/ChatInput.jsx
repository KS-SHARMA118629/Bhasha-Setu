import { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Mic, MicOff, X, Image, FileText, Smile } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const EMOJI_QUICK = ['😊', '😂', '❤️', '👍', '🔥', '🙏', '😢', '😮', '🎉', '👏', '😍', '🤔'];

const ChatInput = ({
  conversationId,
  senderId,
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
}) => {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const typingTimeout = useRef(null);

  // Auto-grow textarea
  const textareaRef = useRef(null);
  const autoGrow = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    autoGrow();
    onTyping?.();
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTyping?.(false), 2000);
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && !editingMessage) return;

    if (editingMessage) {
      await supabase
        .from('messages')
        .update({ content: trimmed, edited: true })
        .eq('id', editingMessage.id);
      onCancelEdit?.();
    } else {
      await onSend?.({ content: trimmed, message_type: 'text', reply_to: replyTo?.id || null });
    }
    setText('');
    onCancelReply?.();
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Upload a file to chat-media bucket
  const uploadFile = async (file, type = 'file') => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${conversationId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('chat-media').upload(path, file, { upsert: true });
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('chat-media').getPublicUrl(path);
      let msgType = type;
      if (file.type.startsWith('image/')) msgType = 'image';
      else if (file.type.startsWith('video/')) msgType = 'video';
      else if (file.type.startsWith('audio/')) msgType = 'audio';

      await onSend?.({ content: file.name, message_type: msgType, media_url: publicUrl });
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'voice.webm', { type: 'audio/webm' });
        setUploading(true);
        const path = `${conversationId}/voice_${Date.now()}.webm`;
        const { error } = await supabase.storage.from('voice-notes').upload(path, file);
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from('voice-notes').getPublicUrl(path);
          await onSend?.({ content: 'Voice message', message_type: 'audio', media_url: publicUrl });
        }
        setUploading(false);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch (err) {
      console.error('Mic access denied:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="chat-input-wrapper">
      {/* Reply / Edit preview */}
      {(replyTo || editingMessage) && (
        <div className="chat-input-banner">
          <div className="chat-input-banner-bar" />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
              {editingMessage ? 'Editing message' : `Replying to ${replyTo?.sender_name || 'message'}`}
            </strong>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>
              {editingMessage ? editingMessage.content : replyTo?.content}
            </p>
          </div>
          <button onClick={editingMessage ? onCancelEdit : onCancelReply} className="chat-input-banner-close">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Emoji quick picker */}
      {showEmoji && (
        <div className="emoji-quick-picker">
          {EMOJI_QUICK.map((e) => (
            <button key={e} onClick={() => { setText((t) => t + e); setShowEmoji(false); }}>
              {e}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-row">
        {/* Emoji toggle */}
        <button className="chat-input-icon-btn" onClick={() => setShowEmoji((v) => !v)} title="Emoji">
          <Smile size={22} />
        </button>

        {/* File attachment */}
        <button className="chat-input-icon-btn" onClick={() => fileInputRef.current?.click()} title="Attach file" disabled={uploading}>
          <Paperclip size={22} />
        </button>
        <input ref={fileInputRef} type="file" onChange={handleFileSelect} style={{ display: 'none' }} accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip" />

        {/* Text area */}
        <textarea
          ref={textareaRef}
          className="chat-input-textarea"
          placeholder={recording ? '🔴 Recording...' : 'Type a message...'}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={recording}
        />

        {/* Voice recording */}
        <button
          className={`chat-input-icon-btn ${recording ? 'chat-input-icon-btn--recording' : ''}`}
          onClick={recording ? stopRecording : startRecording}
          title={recording ? 'Stop recording' : 'Voice message'}
          disabled={uploading}
        >
          {recording ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        {/* Send */}
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={(!text.trim() && !editingMessage) || uploading}
          title="Send"
        >
          {uploading ? (
            <span className="chat-send-spinner" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
