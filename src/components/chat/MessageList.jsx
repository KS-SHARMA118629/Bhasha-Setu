import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { formatDateLabel } from '../../lib/chatUtils';

const MessageList = ({ messages, currentUserId, profiles, typingUsers, onReact, onReply, onDelete, onEdit }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  if (!messages) return null;

  // Group messages by date
  const groups = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const label = formatDateLabel(msg.created_at);
    if (label !== lastDate) {
      groups.push({ type: 'date', label });
      lastDate = label;
    }
    groups.push({ type: 'msg', msg });
  });

  return (
    <div className="message-list">
      {groups.map((item, i) =>
        item.type === 'date' ? (
          <div key={`date-${i}`} className="date-separator">
            <span>{item.label}</span>
          </div>
        ) : (
          <MessageBubble
            key={item.msg.id}
            message={item.msg}
            isMine={item.msg.sender_id === currentUserId}
            sender={profiles?.[item.msg.sender_id]}
            onReact={onReact}
            onReply={onReply}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )
      )}

      {typingUsers?.length > 0 && (
        <TypingIndicator users={typingUsers} profiles={profiles} />
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
