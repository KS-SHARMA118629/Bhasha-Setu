import { useState } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';

const AssistantChatbot = ({ language = 'en' }) => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Hello! I am your BhashaSetu Assistant. How can I help you with government services today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Placeholder for actual AI integration (e.g. OpenAI / Supabase Edge Functions)
    setTimeout(() => {
      const botResponse = { 
        role: 'system', 
        content: `(Translated back to ${language.toUpperCase()}): I understood your query about "${userMessage.content}". Would you like me to help you create a support ticket for this?` 
      };
      setMessages((prev) => [...prev, botResponse]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Bot color="var(--primary)" />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>AI Multilingual Assistant</h3>
      </div>
      
      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex', gap: '8px',
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%'
          }}>
            {msg.role === 'system' && <Bot size={20} color="var(--primary)" style={{ marginTop: '4px' }} />}
            <div style={{
              background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              padding: '10px 14px', borderRadius: '12px',
              color: msg.role === 'user' ? '#fff' : 'var(--text-main)'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Loader2 size={16} className="spin" /> Translating and processing...
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
        <input 
          type="text" className="input-field" 
          placeholder="Ask in any Indian language..." 
          value={input} onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }} disabled={loading}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default AssistantChatbot;
