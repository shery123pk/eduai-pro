import { renderMath, containsMath } from '../utils/mathHelper';

const MathRenderer = ({ content, className = '' }) => {
  if (!content) return null;

  if (containsMath(content)) {
    return (
      <div
        className={`math-content ${className}`}
        dangerouslySetInnerHTML={{ __html: renderMath(content) }}
      />
    );
  }

  // Split by newlines and render with proper formatting
  const paragraphs = content.split('\n\n');

  return (
    <div className={className}>
      {paragraphs.map((para, idx) => (
        <p key={idx} className="mb-4 last:mb-0 whitespace-pre-wrap">
          {para}
        </p>
      ))}
    </div>
  );
};

export default MathRenderer;
