import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes } from 'react-icons/fa'

export default function AdminModal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  children, 
  footer,
  maxWidthClass = "max-w-5xl"
}) {
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (typeof document === 'undefined') return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-secondary/60 backdrop-blur-sm overflow-hidden">
          {/* Backdrop Click Target */}
          <div className="absolute inset-0 z-0" onClick={onClose}></div>
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.95, opacity: 0 }} 
            className={`relative z-10 bg-white rounded-2xl w-full ${maxWidthClass} shadow-2xl flex flex-col`}
            style={{ 
              width: 'min(1600px, 95vw)', 
              maxHeight: '90vh' 
            }}
          >
            {/* Header - Fixed Height */}
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-border-light bg-gray-50/50 shrink-0">
              <div>
                <h3 className="text-xl font-bold font-display text-secondary">{title}</h3>
                {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
              </div>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col min-h-0 bg-white">
              {children}
            </div>

            {/* Footer - Fixed Height */}
            {footer && (
              <div className="p-5 md:p-6 border-t border-border-light bg-gray-50/50 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}
