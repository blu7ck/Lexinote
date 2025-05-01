import { useState } from 'react';
import LexisPage from '../pages/LexisPage';
import MyNotesPage from '../pages/MyNotesPage';
import useAuth from '../hooks/useAuth';

export default function MainApp() {
  const [selectedSection, setSelectedSection] = useState<'lexis' | 'notes'>('lexis');
  const { signOutUser } = useAuth();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Üst Butonlar */}
      <div className="flex justify-between items-center p-4 bg-gray-100">
        {/* Sol Butonlar */}
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedSection('lexis')}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              selectedSection === 'lexis' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border border-purple-600'
            }`}
          >
            Lexis
          </button>

          <button
            onClick={() => setSelectedSection('notes')}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              selectedSection === 'notes' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border border-purple-600'
            }`}
          >
            My Notes
          </button>
        </div>

        {/* Sağda Logout Butonu */}
        <button
          onClick={signOutUser}
          className="px-6 py-2 rounded-full font-semibold bg-red-500 hover:bg-red-600 text-white transition"
        >
          Logout
        </button>
      </div>

      {/* İçerik Alanı */}
      <div className="flex-1 grid place-items-center overflow-hidden">
        {selectedSection === 'lexis' && (
          <div className="h-full w-full max-w-6xl overflow-y-auto p-8">
            <LexisPage />
          </div>
        )}
        {selectedSection === 'notes' && (
          <div className="h-full w-full max-w-4xl overflow-y-auto p-8">
            <MyNotesPage />
          </div>
        )}
        {!selectedSection && (
          <div className="flex flex-col items-center justify-center">
            <img
              src="/lexinote-logo.png"
              alt="Lexinote Logo"
              className="mx-auto mb-4 w-28 h-28 opacity-70"
            />
            <h1 className="text-5xl font-bold text-gray-400 tracking-wide">LEXINOTE</h1>
          </div>
        )}
      </div>
    </div>
  );
}