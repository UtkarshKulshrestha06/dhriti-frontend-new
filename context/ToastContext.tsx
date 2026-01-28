
import React, { createContext, useContext, useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[1000] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right duration-300 ${
              toast.type === 'success' ? 'bg-white border-green-200 text-slate-800' :
              toast.type === 'error' ? 'bg-white border-red-200 text-slate-800' :
              'bg-white border-blue-200 text-slate-800'
            }`}
          >
             <div className={`p-1 rounded-full ${
               toast.type === 'success' ? 'bg-green-100 text-green-600' :
               toast.type === 'error' ? 'bg-red-100 text-red-600' :
               'bg-blue-100 text-blue-600'
             }`}>
               {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
               {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
               {toast.type === 'info' && <Info className="w-4 h-4" />}
             </div>
             <p className="font-bold text-sm">{toast.message}</p>
             <button onClick={() => removeToast(toast.id)} className="ml-2 text-gray-400 hover:text-gray-600">
               <X className="w-3 h-3" />
             </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
