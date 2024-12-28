import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { AIImageModal } from './AIImageModal';

interface FloatingAIButtonProps {
  levelName?: string;
  onImageSelect: (url: string) => void;
}

export function FloatingAIButton({ levelName, onImageSelect }: FloatingAIButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 p-4 bg-[rgb(255,127,80)] text-white rounded-full shadow-lg hover:bg-[rgb(255,100,50)] transition-colors duration-200 z-40"
        title="Generate AI images"
      >
        <Bot className="w-6 h-6" />
      </button>

      {showModal && (
        <AIImageModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onImageSelect={onImageSelect}
          levelName={levelName}
        />
      )}
    </>
  );
}