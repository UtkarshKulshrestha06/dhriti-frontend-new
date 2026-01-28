
import React from 'react';

// A simple component to render text with **bold** and *italic* formatting
const MarkdownText: React.FC<{ text: string, className?: string }> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split by newlines first to handle paragraphs
  const paragraphs = text.split('\n');

  return (
    <div className={className}>
      {paragraphs.map((para, i) => (
        <p key={i} className="mb-2 last:mb-0">
          {renderLine(para)}
        </p>
      ))}
    </div>
  );
};

const renderLine = (line: string) => {
  // Regex to match **bold** and *italic*
  // This is a basic parser. For production, use a library like react-markdown.
  const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} className="italic text-slate-700">{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

export default MarkdownText;
