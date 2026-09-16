import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * Individual Toast Notification Card
 */
export const Toast = ({ id, message, type = 'info', onClose }) => {
  const types = {
    success: {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />,
      border: 'border-emerald-200',
      bg: 'bg-emerald-50 text-emerald-900',
    },
    error: {
      icon: <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0" />,
      border: 'border-red-200',
      bg: 'bg-red-50 text-red-900',
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />,
      border: 'border-amber-200',
      bg: 'bg-amber-50 text-amber-900',
    },
    info: {
      icon: <Info className="w-4 h-4 text-artisan-terracotta flex-shrink-0" />,
      border: 'border-artisan-heather',
      bg: 'bg-artisan-cream text-artisan-espresso',
    },
  };

  const current = types[type] || types.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border shadow-card text-xs sm:text-sm max-w-sm pointer-events-auto ${current.border} ${current.bg}`}
    >
      <div className="flex items-center gap-2.5">
        {current.icon}
        <p className="font-medium leading-snug">{message}</p>
      </div>

      <button
        type="button"
        onClick={() => onClose(id)}
        className="p-1 rounded-full opacity-70 hover:opacity-100 transition"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

export default Toast;
