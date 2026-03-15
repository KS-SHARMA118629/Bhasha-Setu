import { resolveAvatar } from '../../lib/chatUtils';

const TypingIndicator = ({ users, profiles }) => {
  if (!users?.length) return null;

  const names = users
    .map((uid) => profiles?.[uid]?.name || 'Someone')
    .slice(0, 2)
    .join(', ');

  const label = users.length > 2
    ? `${names} and ${users.length - 2} more ${users.length - 2 === 1 ? 'is' : 'are'} typing`
    : `${names} ${users.length === 1 ? 'is' : 'are'} typing`;

  return (
    <div className="typing-row">
      <div className="typing-bubble">
        <span className="typing-label">{label}</span>
        <div className="typing-dots">
          <span className="typing-dot" style={{ animationDelay: '0ms' }} />
          <span className="typing-dot" style={{ animationDelay: '200ms' }} />
          <span className="typing-dot" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
