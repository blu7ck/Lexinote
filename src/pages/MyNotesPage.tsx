import { useCallback, useEffect, useState } from 'react';
import { SearchInput } from '../components/MyNotes/SearchInput';
import { MyNotes } from '../components/MyNotes/MyNotes';
import { CreateNoteDialog } from '../components/MyNotes/CreateNoteDialog';
import { EditNoteDialog } from '../components/MyNotes/EditNoteDialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { fetchNotes, createNote, updateNote, deleteNote, Note } from '../services/NotesService';
import  useAuth  from '../hooks/useAuth';

export default function MyNotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const loadNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const fetchedNotes = await fetchNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes!');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCreate = async (title: string, content: string) => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content cannot be empty!');
      return;
    }

    try {
      const newNote = await createNote(title, content);
      setNotes((prev) => [newNote, ...prev]);
      toast.success('Note created successfully!');
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note!');
    }
  };

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (title: string, content: string) => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content cannot be empty!');
      return;
    }

    if (!selectedNote) return;

    try {
      await updateNote(selectedNote.id, title, content);
      setNotes((prev) =>
        prev.map((note) =>
          note.id === selectedNote.id ? { ...note, title, content } : note
        )
      );
      toast.success('Note updated successfully!');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note!');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      toast.success('Note deleted successfully!');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note!');
    }
  };

  return (
    <div className="p-8 flex flex-col gap-6 max-w-2xl mx-auto relative">
      {/* ➕ Yeni Not Butonu */}
      <button
        onClick={() => setIsCreateOpen(true)}
        disabled={loading}
        className="fixed bottom-8 right-8 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shadow-lg z-40 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus size={28} />
      </button>

      {/* Arama Çubuğu */}
      <SearchInput
        placeholder="Search your notes..."
        value={search}
        onChange={setSearch}
      />

      {/* Not Listesi veya Loading */}
      {loading ? (
  <div className="text-center mt-10 text-lg font-semibold">
    Loading...
  </div>
) : (
  <MyNotes
    notes={notes.filter((note) =>
      note &&
      note.title &&
      note.content &&
      (
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase())
      )
    )}
    search={search}
    onEdit={(note) => handleEdit(note)}
    onDelete={(note) => handleDelete(note.id)}
  />
)}


      {/* Create Note Dialog */}
      <CreateNoteDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
      />

      {/* Edit Note Dialog */}
      {selectedNote && (
        <EditNoteDialog
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedNote(null);
          }}
          onSave={handleSaveEdit}
          initialTitle={selectedNote.title}
          initialContent={selectedNote.content}
        />
      )}
    </div>
  );
}
