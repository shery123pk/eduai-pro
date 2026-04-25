import MathRenderer from './MathRenderer';
import ShapeRenderer from './ShapeRenderer';

const ChatMessage = ({ message, isUser, language }) => {
  const { content, sources, shape } = message;
  const isUrdu = language === 'urdu';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black flex-shrink-0 mr-2 mt-1 shadow-md">
          AI
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm'
            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
        }`}
      >
        <MathRenderer
          content={content}
          className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-slate-800'} ${isUrdu ? 'font-urdu' : ''}`}
        />

        {shape && !isUser && <ShapeRenderer shapeName={shape} />}

        {sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-400 mb-1">Sources:</p>
            {sources.map((source, idx) => (
              <p key={idx} className="text-xs text-slate-400 truncate">
                📄 {source}
              </p>
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-black flex-shrink-0 ml-2 mt-1">
          You
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
