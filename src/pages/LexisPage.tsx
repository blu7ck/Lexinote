import React, { useEffect, useState, useCallback } from "react";
import { fetchWordsByGroup, Word, getFolderLettersByLanguage, FolderLetter } from "../services/WordService";
import { fetchUserGroups, Group } from "../services/MembershipService";
import useAuth from "../hooks/useAuth";
import Lexis from "../components/Lexis/Lexis";
import NewWordDialog from "../components/Lexis/CreateWordDialog";
import { toast } from "sonner";

const LexisPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loadingWords, setLoadingWords] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [search, setSearch] = useState('');
  const [folderLetters, setFolderLetters] = useState<FolderLetter[]>([]);

  const loadGroups = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchUserGroups();
      setGroups(data);
    } catch (error) {
      console.error('Gruplar yüklenemedi:', error);
      toast.error('Gruplar yüklenemedi.');
    }
  }, [user]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const onGroupChange = async (groupId: string) => {
    const group = groups.find(g => g.id === groupId) ?? null;
    setSelectedGroup(group);
    setSearch('');
    
    if (!group) {
      setWords([]);
      return;
    }

    try {
      setLoadingWords(true);
      const letters = await getFolderLettersByLanguage(group.language);
      const wds = await fetchWordsByGroup(groupId);
      setFolderLetters(letters);
      setWords(wds);
    } catch (error) {
      console.error('Kelimeler veya harfler yüklenemedi:', error);
      toast.error('Kelimeler yüklenemedi.');
    } finally {
      setLoadingWords(false);
    }
  };

  const handleWordAdded = () => {
    if (selectedGroup) {
      onGroupChange(selectedGroup.id);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 font-semibold text-lg">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Üst Alan: Grup Seçimi, Arama ve Ekleme Butonu */}
      <div className="flex items-center justify-between mb-6">
        <select
          value={selectedGroup?.id || ''}
          onChange={(e) => onGroupChange(e.target.value)}
          className="border rounded-lg p-2 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Grup Seçiniz</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        {selectedGroup?.id && (
          <>
            <input
              type="text"
              placeholder="Kelime ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-4 p-2 border rounded-lg bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => setShowDialog(true)}
              className="ml-4 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
            >
              + Kelime Ekle
            </button>
          </>
        )}
      </div>

      {/* Kelimeler */}
      <div className="mt-6">
        {loadingWords ? (
          <div className="text-center text-gray-500">Kelimeler yükleniyor...</div>
        ) : (
          <Lexis
            words={words.filter((word) =>
              word.title.toLowerCase().includes(search.toLowerCase())
            )}
            selectedGroup={selectedGroup}  
            onWordUpdated={handleWordAdded}
          />
        )}
      </div>

      {/* Yeni Kelime Ekleme Dialogu */}
      {showDialog && selectedGroup && (
        <NewWordDialog
        group={selectedGroup}               // ✅ sadece bu olacak
        folderLetters={folderLetters}
        onClose={() => setShowDialog(false)}
        onWordAdded={handleWordAdded}
      />
      
      )}
    </div>
  );
};

export default LexisPage;
