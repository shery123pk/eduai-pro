import MathRenderer from './MathRenderer';

const ChatMessage = ({ message, isUser }) => {
  const { content, sources } = message;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-3 ${
          isUser
            ? 'gradient-primary text-white'
            : 'glassmorphism text-slate-100'
        }`}
      >
        <MathRenderer content={content} className="text-sm leading-relaxed" />

        {sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-600">
            <p className="text-xs text-slate-300 mb-1">Sources:</p>
            {sources.map((source, idx) => (
              <p key={idx} className="text-xs text-slate-400 truncate">
                📄 {source}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
