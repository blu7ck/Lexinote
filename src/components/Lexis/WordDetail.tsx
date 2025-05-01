import { useEffect, useState } from 'react';
import { Word } from '../../types/Word';
import { supabase } from '../../lib/supabaseClient';

interface Props {
  word: Word | null;
  onEdit?: () => void;
}

export default function WordDetail({ word, onEdit }: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const loadSignedUrl = async () => {
      if (!word?.image_url) {
        setImageSrc(null);
        return;
      }

      const filePath = word.image_url.startsWith("http")
        ? word.image_url.replace(
            "https://fungolwlkfwkyfdyevrq.supabase.co/storage/v1/object/public/word-images/",
            ""
          )
        : word.image_url;

      const { data, error } = await supabase
        .storage
        .from('word-images')
        .createSignedUrl(filePath, 60 * 60);

      if (error) {
        console.error('Signed URL alınamadı:', error.message);
      } else {
        setImageSrc(data?.signedUrl || null);
      }
    };

    loadSignedUrl();
  }, [word]);

  if (!word) return null;

  return (
    <div className="p-4 border-l w-full">
      {imageSrc && (
        <img
          src={imageSrc}
          alt={word.title}
          className="h-48 mb-4 object-contain"
        />
      )}
      <h1 className="text-2xl font-bold">{word.title}</h1>
      <p className="text-sm text-gray-500 mt-1">{word.folder_letter}</p>
      <div
        className="mt-2"
        dangerouslySetInnerHTML={{ __html: word.formatted_notes || '' }}
      ></div>

      {onEdit && (
        <button
          onClick={onEdit}
          className="mt-4 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded"
        >
          ✏️ Düzenle
        </button>
      )}
    </div>
  );
}
