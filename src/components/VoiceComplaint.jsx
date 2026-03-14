import 'regenerator-runtime/runtime';
import { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, Send, Cpu } from 'lucide-react';

const VoiceComplaint = ({ onSubmit, language = 'en' }) => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  if (!browserSupportsSpeechRecognition) {
    return <p style={{ color: 'var(--danger)' }}>Browser doesn't support speech recognition.</p>;
  }

  const handleCreateTicket = () => {
    if (!transcript.trim()) return;
    setLoading(true);
    setStatusMsg('Detecting Language and Translating to English for Officials...');
    
    // Simulate AI Translation Delay
    setTimeout(() => {
      onSubmit({ 
        title: 'Voice Registered Complaint', 
        description: `Original: ${transcript}\nTranslated (EN): [AI Simulated Translation resulting English transcript]`, 
        category: 'Voice Input' 
      });
      resetTranscript();
      setLoading(false);
      setStatusMsg('Ticket successfully created and translated!');
      setTimeout(() => setStatusMsg(''), 3000);
    }, 2000);
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.25rem' }}>Voice Complaint Filing</h3>
      <p style={{ color: 'var(--text-muted)' }}>
        Speak your complaint in {language.toUpperCase()} naturally. Our AI will automatically translate and structure it into a formal ticket for government officials.
      </p>
      
      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
        <button
          onClick={listening ? SpeechRecognition.stopListening : () => SpeechRecognition.startListening({ continuous: true })}
          style={{
            width: '80px', height: '80px', borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: listening ? 'var(--danger)' : 'var(--primary)',
            color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center',
            boxShadow: listening ? '0 0 20px rgba(239, 68, 68, 0.6)' : 'none',
            transition: 'all 0.3s'
          }}
        >
          {listening ? <MicOff size={32} /> : <Mic size={32} />}
        </button>
        {listening && <span style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--danger)', borderRadius: '12px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 'bold' }}>REC</span>}
      </div>

      <div style={{ width: '100%', minHeight: '80px', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
        {transcript || "Tap microphone and start speaking..."}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
        <button onClick={resetTranscript} className="btn-secondary" style={{ flex: 1 }}>Clear</button>
        <button onClick={handleCreateTicket} disabled={!transcript || loading} className="btn-primary" style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          {loading ? <Cpu size={18} className="spin" /> : <Send size={18} />} Convert to Ticket
        </button>
      </div>

      {statusMsg && <div style={{ color: 'var(--success)', fontSize: '0.9rem', display: 'flex', gap: '4px', alignItems: 'center' }}><Cpu size={14}/> {statusMsg}</div>}
    </div>
  );
};

export default VoiceComplaint;
