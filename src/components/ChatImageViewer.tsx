import React from "react";
import { X } from "lucide-react";

interface ChatImageViewerProps {
  src: string;
  onClose: () => void;
}

const ChatImageViewer: React.FC<ChatImageViewerProps> = ({ src, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors z-10"
        aria-label="Close"
      >
        <X className="h-6 w-6 text-white" />
      </button>
      <img
        src={src}
        alt="Full view"
        className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default ChatImageViewer;
