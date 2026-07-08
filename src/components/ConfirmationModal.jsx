import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  title = 'Are you sure?', 
  message = 'This action cannot be undone.', 
  confirmText = 'Delete', 
  cancelText = 'Cancel', 
  onConfirm, 
  onCancel,
  isDanger = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#060a13]/85 backdrop-blur-sm transition-opacity duration-300"
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md glass-panel p-6 sm:p-7 rounded-3xl shadow-2xl animate-fade-in z-10 space-y-6">
        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Info Layout */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl ${isDanger ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-light">{message}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/50 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center gap-2 shadow-lg cursor-pointer ${
              isDanger 
                ? 'bg-red-650 hover:bg-red-550 shadow-red-950/40 border border-red-500/30' 
                : 'bg-brand-600 hover:bg-brand-500 shadow-brand-950/40 border border-brand-500/30'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
