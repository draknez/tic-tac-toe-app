import React, { useEffect } from 'react';
import Button from './Button';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Aviso", 
  description, 
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  variant = "primary", 
  isAlert = false 
}) => {
  
  // Bloquear scroll cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop con Blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Contenedor del Diálogo */}
      <div className="relative bg-white dark:bg-gray-950 p-10 w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800 rounded-[3rem] animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
        
        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-3 leading-tight text-center">
          {title}
        </h3>
        
        <div className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-10 text-sm text-center">
          {description}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {!isAlert && (
            <Button 
              variant="secondary" 
              onClick={onClose}
              className="font-bold order-2 sm:order-1 h-14 rounded-2xl px-8"
            >
              {cancelText}
            </Button>
          )}
          <Button 
            variant={variant} 
            onClick={handleConfirm}
            className={`font-black uppercase tracking-widest order-1 sm:order-2 h-14 rounded-2xl px-10 ${isAlert ? 'w-full' : ''}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
