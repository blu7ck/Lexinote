import { FC } from 'react';
import { NoteCard } from './NoteCard';

interface Note {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  folder_type?: string;
  category?: string;
  user_id: string;
  created_at?: string;
  subhead?: string;
}

interface NotesListProps {
  notes: Note[];
  search: string;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export const MyNotes: FC<NotesListProps> = ({ notes, search, onEdit, onDelete }) => {
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.content.toLowerCase().includes(search.toLowerCase())
  );

  if (filteredNotes.length === 0) {
    return (
      <div className="text-gray-500 text-center mt-8">
        No notes found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {filteredNotes.map((note) => (
        <NoteCard
          key={note.id}
          title={note.title}
          subhead={note.subhead || ''}
          content={note.content}
          onEdit={() => onEdit(note)}
          onDelete={() => onDelete(note)}
        />
      ))}
    </div>
  );
};
