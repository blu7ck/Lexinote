import { useState, useEffect, useRef } from "react";
import { createWord, getFolderLettersByLanguage, FolderLetter } from "../../services/WordService";
import { supabase } from "../../lib/supabaseClient";
import useAuth from "../../hooks/useAuth";
import { toast } from "sonner";
import { Group } from "../../services/MembershipService";

interface CreateWordDialogProps {
  group: Group;
  folderLetters: FolderLetter[];
  onWordAdded: () => void;
  onClose: () => void;
}

const CreateWordDialog: React.FC<CreateWordDialogProps> = ({
  group,
  onWordAdded,
  onClose
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [folderLetterId, setFolderLetterId] = useState('');
  const [folderLetters, setFolderLetters] = useState<FolderLetter[]>([]);
  const notesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadFolderLetters = async () => {
      try {
        const letters = await getFolderLettersByLanguage(group.language);
        setFolderLetters(letters);
      } catch (error) {
        console.error(error);
        toast.error("Harf klasörleri yüklenemedi.");
      }
    };

    loadFolderLetters();
  }, [group.language]);

  const handleFormatting = (command: string, value?: string) => {
    document.execCommand(command, false, value || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderLetterId) {
      toast.error("Harf seçmelisiniz.");
      return;
    }

    const imagePath = imageFile ? `words/${Date.now()}_${imageFile.name}` : undefined;
    const formattedNotes = notesRef.current?.innerHTML || '';

    try {
      await createWord({
        groupId: group.id,
        userId: user!.id,
        title,
        imageUrl: imagePath,
        folderLetterId,
        formattedNotes
      });

      if (imageFile && imagePath) {
        const { error } = await supabase.storage
          .from("word-images")
          .upload(imagePath, imageFile);
        if (error) {
          console.error(error);
          toast.warning("Kelime kaydedildi ama görsel yüklenemedi.");
        }
      }

      toast.success("Kelime başarıyla eklendi!");
      onWordAdded();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Kelime eklenirken hata oluştu.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 animate-fade">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl max-h-screen overflow-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Yeni Kelime Ekle</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Başlık"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border rounded-lg p-2"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="border rounded-lg p-2"
          />

          <select
            value={folderLetterId}
            onChange={(e) => setFolderLetterId(e.target.value)}
            required
            className="border rounded-lg p-2"
          >
            <option value="">Harf Seçiniz</option>
            {folderLetters.map((fl) => (
              <option key={fl.id} value={fl.id}>
                {fl.letter} ({fl.label})
              </option>
            ))}
          </select>

          {/* Zengin Not Alanı */}
          <div>
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={() => handleFormatting('bold')} title="Kalın">B</button>
              <button type="button" onClick={() => handleFormatting('italic')} title="İtalik">I</button>
              <button type="button" onClick={() => handleFormatting('underline')} title="Altı çizili">U</button>
              <input type="color" onChange={(e) => handleFormatting('foreColor', e.target.value)} title="Yazı rengi" />
            </div>
            <div
              ref={notesRef}
              contentEditable
              className="border rounded-lg p-3 min-h-[120px] max-h-60 overflow-auto"
              style={{ whiteSpace: "pre-wrap" }}
            ></div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
            >
              Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWordDialog;
