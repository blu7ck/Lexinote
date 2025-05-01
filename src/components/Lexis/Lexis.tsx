import React from "react";
import WordCard from "./WordCard";
import { Group } from "../../services/MembershipService";

export interface Word {
  id: string;
  title: string;
  image_url: string;
  author_name: string;
  folder_letter_id: string;
  group_id: string;
  user_id: string;
  created_at: string;
}

interface WordListProps {
  words: Word[];
  selectedGroup: Group | null;
  onWordUpdated: () => void;
}

const Lexis: React.FC<WordListProps> = ({ words, selectedGroup, onWordUpdated }) => {
  if (!selectedGroup) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Lütfen önce bir grup seçin.
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Hiç kelime bulunamadı.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {words.map((word) => (
        <WordCard
          key={word.id}
          id={word.id}
          title={word.title}
          authorName={word.author_name}
          imageUrl={word.image_url}
          folderLetterId={word.folder_letter_id}
          groupLanguage={selectedGroup.language} // ✅ artık güvenli
          onWordUpdated={onWordUpdated}
        />
      ))}
    </div>
  );
};

export default Lexis;
