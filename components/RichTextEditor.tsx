
import React, { useState, useRef } from 'react';
import { Bold, Italic, List, Type, Tag, Send } from 'lucide-react';
import Button from './Button';

interface RichTextEditorProps {
  onPost: (data: { title: string, message: string, tags: string[], isImportant: boolean }) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ onPost }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isImportant, setIsImportant] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!title.trim() || !message.trim()) return;
    onPost({ title, message, tags, isImportant });
    setTitle('');
    setMessage('');
    setTags([]);
    setIsImportant(false);
  };

  // Helper to insert markdown format
  const insertFormat = (startChar: string, endChar: string = startChar) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = textareaRef.current.value;
      
      const before = text.substring(0, start);
      const selection = text.substring(start, end);
      const after = text.substring(end);

      // If text is selected, wrap it. If not, just insert the markers and put cursor in between
      const newText = `${before}${startChar}${selection}${endChar}${after}`;
      setMessage(newText);
      
      // Reset focus and selection
      setTimeout(() => {
        if(textareaRef.current) {
          textareaRef.current.focus();
          const cursorPosition = selection.length > 0 ? end + startChar.length + endChar.length : start + startChar.length;
          textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-100 p-3 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm">Create Announcement</h3>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-600 select-none">
           <input 
             type="checkbox" 
             checked={isImportant} 
             onChange={(e) => setIsImportant(e.target.checked)}
             className="w-4 h-4 rounded border-gray-300 text-ocean-600 focus:ring-ocean-500" 
           />
           Mark Important
        </label>
      </div>
      
      <div className="p-4 space-y-4">
        <input 
          type="text" 
          placeholder="Announcement Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-lg font-bold placeholder:text-gray-300 border-none focus:ring-0 p-0 text-slate-900 bg-white"
        />
        
        {/* Editor Toolbar */}
        <div className="flex gap-2 border-y border-gray-100 py-2">
           <button onClick={() => insertFormat('**')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-ocean-600 transition-colors" title="Bold (Ctrl+B)"><Bold className="w-4 h-4" /></button>
           <button onClick={() => insertFormat('*')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-ocean-600 transition-colors" title="Italic (Ctrl+I)"><Italic className="w-4 h-4" /></button>
           <button onClick={() => insertFormat('### ')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-ocean-600 transition-colors" title="Heading"><Type className="w-4 h-4" /></button>
           <button onClick={() => insertFormat('- ')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-ocean-600 transition-colors" title="List"><List className="w-4 h-4" /></button>
           <div className="w-px bg-gray-200 mx-1"></div>
           <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5 border border-gray-200">
             <Tag className="w-3 h-3 text-gray-500" />
             <input 
               type="text" 
               placeholder="Add tags..." 
               value={tagInput}
               onChange={(e) => setTagInput(e.target.value)}
               onKeyDown={handleAddTag}
               className="bg-transparent border-none text-xs focus:ring-0 w-24 p-0 text-slate-800 placeholder:text-gray-400"
             />
           </div>
        </div>

        <textarea 
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here... Use **bold** and *italic* for formatting."
          className="w-full min-h-[120px] border-none focus:ring-0 p-0 text-slate-800 resize-none leading-relaxed bg-white"
        ></textarea>

        {/* Tags Display */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
             {tags.map(tag => (
               <span key={tag} className="inline-flex items-center px-2 py-1 rounded bg-ocean-100 text-ocean-700 border border-ocean-200 text-xs font-bold">
                 #{tag}
                 <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500 text-ocean-400">&times;</button>
               </span>
             ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
           <Button onClick={handleSubmit} size="sm" className="rounded-lg shadow-md shadow-ocean-200 flex items-center gap-2">
             Post Announcement <Send className="w-3 h-3" />
           </Button>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
