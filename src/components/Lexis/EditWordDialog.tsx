import { useState, useEffect, useRef } from "react";
import { updateWord, getFolderLettersByLanguage, FolderLetter } from "../../services/WordService";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";

interface EditWordDialogProps {
  wordId: string;
  initialTitle: string;
  initialImageUrl: string;
  initialFolderLetterId: string;
  groupLanguage: string;
  onClose: () => void;
  onWordUpdated: () => void;
}

const EditWordDialog: React.FC<EditWordDialogProps> = ({
  wordId,
  initialTitle,
  initialImageUrl,
  initialFolderLetterId,
  groupLanguage,
  onClose,
  onWordUpdated,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [folderLetterId, setFolderLetterId] = useState(initialFolderLetterId);
  const [folderLetters, setFolderLetters] = useState<FolderLetter[]>([]);
  const [loading, setLoading] = useState(false);
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);
  const notesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadFolderLetters = async () => {
      try {
        const letters = await getFolderLettersByLanguage(groupLanguage);
        setFolderLetters(letters);
      } catch (error) {
        console.error(error);
        toast.error("Harf klasörleri yüklenemedi.");
      }
    };

    const loadSignedImageUrl = async () => {
      if (!initialImageUrl) return;

      const filePath = initialImageUrl.startsWith("http")
        ? initialImageUrl.replace(
            "https://fungolwlkfwkyfdyevrq.supabase.co/storage/v1/object/public/word-images/",
            ""
          )
        : initialImageUrl;

      const { data, error } = await supabase
        .storage
        .from("word-images")
        .createSignedUrl(filePath, 60 * 60);

      if (error) {
        console.error("Signed URL alınamadı:", error.message);
      } else {
        setSignedImageUrl(data?.signedUrl || null);
      }
    };

    loadFolderLetters();
    loadSignedImageUrl();
  }, [groupLanguage, initialImageUrl]);

  const handleFormatting = (command: string, value?: string) => {
    document.execCommand(command, false, value || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Başlık boş olamaz.");
      return;
    }
    if (!folderLetterId) {
      toast.error("Harf klasörü seçmelisiniz.");
      return;
    }

    let uploadedUrl = initialImageUrl;

    if (imageFile) {
      const filePath = `words/${Date.now()}_${imageFile.name}`;

      const { error } = await supabase.storage
        .from("word-images")
        .upload(filePath, imageFile);

      if (error) {
        console.error(error);
        toast.error("Görsel yüklenemedi.");
        return;
      }

      uploadedUrl = filePath;
    }

    try {
      setLoading(true);
      await updateWord({
        wordId,
        title,
        imageUrl: uploadedUrl,
        folderLetterId,
        formattedNotes: notesRef.current?.innerHTML || ''
      });

      toast.success("Kelime başarıyla güncellendi!");
      onWordUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Kelime güncellenemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 animate-fade">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-screen overflow-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Kelimeyi Düzenle</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Başlık"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border rounded-lg p-2"
          />

          {signedImageUrl && (
            <img
              src={signedImageUrl}
              alt="Mevcut Görsel"
              className="w-24 h-24 object-cover rounded mx-auto"
            />
          )}

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
            <option value="">Harf Klasörü Seç</option>
            {folderLetters.map((fl) => (
              <option key={fl.id} value={fl.id}>
                {fl.letter} ({fl.label})
              </option>
            ))}
          </select>

          <div>
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={() => handleFormatting('bold')}>B</button>
              <button type="button" onClick={() => handleFormatting('italic')}>I</button>
              <button type="button" onClick={() => handleFormatting('underline')}>U</button>
              <input type="color" onChange={(e) => handleFormatting('foreColor', e.target.value)} />
            </div>
            <div
              ref={notesRef}
              contentEditable
              className="border rounded-lg p-3 min-h-[120px] max-h-60 overflow-auto"
              style={{ whiteSpace: "pre-wrap" }}
            ></div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWordDialog;