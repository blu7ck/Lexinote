import React, { useState, useEffect } from "react";
import EditWordDialog from "./EditWordDialog";
import { deleteWord } from "../../services/WordService";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";

interface WordCardProps {
  id: string;
  title: string;
  imageUrl: string;
  authorName: string;
  folderLetterId: string;
  groupLanguage: string;
  onWordUpdated: () => void;
}

const WordCard: React.FC<WordCardProps> = ({
  id,
  title,
  imageUrl,
  authorName,
  folderLetterId,
  groupLanguage,
  onWordUpdated,
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const getSignedUrl = async () => {
      if (!imageUrl) return;

      const filePath = imageUrl.startsWith("http")
        ? imageUrl.replace(
            "https://fungolwlkfwkyfdyevrq.supabase.co/storage/v1/object/public/word-images/",
            ""
          )
        : imageUrl;

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

    getSignedUrl();
  }, [imageUrl]);

  const handleDelete = async () => {
    if (!confirm("Bu kelimeyi silmek istediğinize emin misiniz?")) {
      return;
    }
    try {
      await deleteWord(id);
      toast.success("Kelime başarıyla silindi!");
      onWordUpdated();
    } catch (error) {
      console.error(error);
      toast.error("Kelime silinirken bir hata oluştu.");
    }
  };

  return (
    <div className="border rounded-xl p-4 flex flex-col items-center shadow-md relative">
      {signedImageUrl && (
        <img
          src={signedImageUrl}
          alt={title}
          className="w-24 h-24 object-cover rounded-lg mb-2"
        />
      )}
      <h3 className="text-lg font-semibold text-center">{title}</h3>
      <p className="text-sm text-gray-500">{authorName}</p>

      {/* Düzenle Butonu */}
      <button
        onClick={() => setShowEditDialog(true)}
        className="absolute top-2 right-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 transition"
        title="Düzenle"
      >
        ✏️
      </button>

      {/* Sil Butonu */}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition"
        title="Sil"
      >
        🗑️
      </button>

      {/* Edit Dialog Açılır */}
      {showEditDialog && (
        <EditWordDialog
          wordId={id}
          initialTitle={title}
          initialImageUrl={imageUrl}
          initialFolderLetterId={folderLetterId}
          groupLanguage={groupLanguage}
          onClose={() => setShowEditDialog(false)}
          onWordUpdated={onWordUpdated}
        />
      )}
    </div>
  );
};

export default WordCard;