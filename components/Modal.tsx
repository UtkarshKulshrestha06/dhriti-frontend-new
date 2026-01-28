
import React from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
           <h2 className="text-xl font-bold text-slate-900">{title}</h2>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>
        
        <div className="p-5 overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
             {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
