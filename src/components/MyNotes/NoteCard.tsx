import { FC } from 'react';
import { Pencil, Trash2 } from 'lucide-react'; // Lucide ikonları için
import { toast } from 'sonner'; // Toast bildirimleri için

interface NoteCardProps {
  title: string;
  subhead?: string;
  content: string;
  onEdit: () => void;
  onDelete: () => void;
}


export const NoteCard: FC<NoteCardProps> = ({ title, subhead, content, onEdit, onDelete }) => {
  return (
    <div className="bg-[#f0f5f3] rounded-xl p-4 shadow-md hover:shadow-lg transition">
      {/* Header Bölümü */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-600">{subhead}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.success('Edit mode opened');
              onEdit();
            }}
            className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow hover:bg-gray-100"
          >
            <Pencil className="w-4 h-4 text-green-700" />
          </button>
          <button
            onClick={() => {
              toast.error('Note deleted');
              onDelete();
            }}
            className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow hover:bg-gray-800"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* İçerik Bölümü */}
      <div className="mt-2 text-gray-800 text-sm">
        {content}
      </div>
    </div>
  );
};
