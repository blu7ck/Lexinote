import { FC, useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EditNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, content: string) => void;
  initialTitle: string;
  initialContent: string;
}

export const EditNoteDialog: FC<EditNoteDialogProps> = ({ isOpen, onClose, onSave, initialTitle, initialContent }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setContent(initialContent);
    }
  }, [isOpen, initialTitle, initialContent]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg relative">
        
        {/* Kapatma Butonu */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold mb-4">Edit Note</h2>

        {/* Title */}
        <input
          type="text"
          placeholder="Title"
          className="w-full p-3 mb-4 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Content */}
        <textarea
          placeholder="Content"
          className="w-full p-3 h-40 border rounded-lg outline-none resize-none focus:ring-2 focus:ring-blue-500"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Kaydet Butonu */}
        <button
          onClick={() => {
            onSave(title, content);
            onClose();
          }}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};
