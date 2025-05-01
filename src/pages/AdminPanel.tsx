import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  fetchGroups,
  fetchGroupMembers,
  addUserToGroup,
  removeUserFromGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  Permissions,
} from '../services/AdminService';
import useAuth from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';

export default function AdminPanel() {
  const { signOutUser } = useAuth();

  const [licenseEnd, setLicenseEnd] = useState<string>('');
  const [newGroupLanguage, setNewGroupLanguage] = useState<string>('ottoman');

  const [groups, setGroups] = useState<{ id: string; name: string; language: string }[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [updatedGroupName, setUpdatedGroupName] = useState<string>('');

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [permissions, setPermissions] = useState<Permissions>({
    can_add_note: false,
    can_edit_note: false,
    can_delete_note: false,
    can_manage_members: false,
  });
  const password = generateRandomPassword();

  const [members, setMembers] = useState<{ fullName: string; email: string }[]>([]);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      const fetched = await fetchGroups();
      setGroups(fetched.map((g) => ({ id: g.id, name: g.name, language: g.language })));
    } catch {
      toast.error('Gruplar yüklenemedi.');
    }
  }

  async function loadMembers(groupId: string) {
    try {
      const fetched = await fetchGroupMembers(groupId);
      const mapped = fetched.map(m => ({ fullName: m.full_name, email: m.email }));
      setMembers(mapped);
    } catch {
      toast.error('Üyeler yüklenemedi.');
    }
  }

  const handleGroupSelect = (id: string) => {
    setSelectedGroupId(id);
    if (id) loadMembers(id);
  };

  const handlePermissionChange = (key: keyof Permissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  function generateRandomPassword(length = 10): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  async function handleAddUser() {
    if (!fullName || !email || !selectedGroupId || !licenseEnd) {
      toast.error('Tüm alanları doldurun.');
      return;
    }
    try {
      await addUserToGroup(fullName, email, selectedGroupId, licenseEnd, permissions);
      await sendWelcomeEmail(email, password, licenseEnd, groups.find(g => g.id === selectedGroupId)?.name || '');

      toast.success('Üye başarıyla eklendi!');

      setFullName('');
      setEmail('');
      setLicenseEnd('');
      setPermissions({ can_add_note: false, can_edit_note: false, can_delete_note: false, can_manage_members: false });
      loadMembers(selectedGroupId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || 'Üye eklenirken hata oluştu.');
      console.error(err);
    }
  }

  async function handleRemoveUser(email: string) {
    try {
      await removeUserFromGroup(email, selectedGroupId);
      toast.success('Kullanıcı silindi.');
      loadMembers(selectedGroupId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || 'Kullanıcı silinirken hata oluştu.');
      console.error(err);
    }
  }

  async function handleCreateGroup() {
    if (!newGroupName || !newGroupLanguage) {
      toast.error('Grup adı ve dil zorunludur.');
      return;
    }
    try {
      await createGroup(newGroupName, newGroupLanguage);
      toast.success('Grup oluşturuldu.');
      setNewGroupName('');
      setNewGroupLanguage('ottoman');
      loadGroups();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || 'Grup oluşturulurken hata oluştu.');
      console.error(err);
    }
  }

  async function handleUpdateGroup() {
    if (!selectedGroupId || !updatedGroupName) {
      toast.error('Grup seçili değil veya yeni isim boş.');
      return;
    }
    try {
      await updateGroup(selectedGroupId, updatedGroupName);
      toast.success('Grup adı güncellendi.');
      setUpdatedGroupName('');
      loadGroups();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || 'Grup güncellenirken hata oluştu.');
      console.error(err);
    }
  }

  async function handleDeleteGroup() {
    if (!selectedGroupId) {
      toast.error('Grup seçili değil.');
      return;
    }
    try {
      await deleteGroup(selectedGroupId);
      toast.success('Grup silindi.');
      setSelectedGroupId('');
      loadGroups();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || 'Grup silinirken hata oluştu.');
      console.error(err);
    }
  }

  async function sendWelcomeEmail(email: string, password: string, licenseEndDate: string, groupName: string) {
    const { data, error } = await supabase.functions.invoke('send-user-created-email', {
      body: { email, password, licenseEndDate, groupName }
    });
    if (error) throw error;
    return data;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      <button
        onClick={signOutUser}
        className="fixed top-6 right-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
      >
        Çıkış Yap
      </button>

      <h1 className="text-3xl font-bold mb-8">Admin Yönetimi</h1>

      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden">
        {/* Sol Panel - Yeni Üye */}
        <div className="flex-1 p-6 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-gray-300">
          <h2 className="text-2xl font-semibold mb-4">Yeni Üye Ekle</h2>
          <input type="text" placeholder="İsim Soyisim" value={fullName} onChange={e => setFullName(e.target.value)} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800" />
          <input type="date" value={licenseEnd} onChange={e => setLicenseEnd(e.target.value)} className="border p-2 rounded w-full" />
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(permissions).map(key => (
              <label key={key} className="flex items-center gap-2 text-gray-700">
                <input type="checkbox" checked={permissions[key as keyof Permissions]} onChange={() => handlePermissionChange(key as keyof Permissions)} />
                {key.replace(/_/g, ' ')}
              </label>
            ))}
          </div>
          <button onClick={handleAddUser} className="bg-green-600 hover:bg-green-700 text-white py-2 rounded w-full">Üye Ekle</button>
        </div>

        {/* Sağ Panel - Grup Yönetimi */}
        <div className="flex-1 p-6 flex flex-col gap-4">
          <h2 className="text-2xl font-semibold mb-4">Grup Yönetimi</h2>
          <select value={selectedGroupId} onChange={e => handleGroupSelect(e.target.value)} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800" >
            <option value="">Grup Seç</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
          <select value={newGroupLanguage} onChange={e => setNewGroupLanguage(e.target.value)} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800" >
            <option value="osmanlica">Osmanlıca</option>
            <option value="italian">İtalyanca</option>
            <option value="greek">Antik Yunanca</option>
            <option value="russian">Rusça</option>
            <option value="egyptian">Antik Mısır</option>
          </select>
          <div className="h-40 overflow-y-auto space-y-2">
            {members.map((member, idx) => (
              <div key={idx} className="bg-gray-100 p-3 rounded flex justify-between items-center">
                <span>{member.fullName} ({member.email})</span>
                <button onClick={() => handleRemoveUser(member.email)} className="text-red-500 hover:text-red-700">❌</button>
              </div>
            ))}
          </div>
          <input type="text" placeholder="Yeni Grup Adı" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="border p-2 rounded w-full" />
          <button onClick={handleCreateGroup} className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded w-full">Grup Oluştur</button>
          <input type="text" placeholder="Yeni Grup İsmi" value={updatedGroupName} onChange={e => setUpdatedGroupName(e.target.value)} className="border p-2 rounded w-full" />
          <button onClick={handleUpdateGroup} className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded w-full">Grup Adını Güncelle</button>
          <button onClick={handleDeleteGroup} className="bg-red-500 hover:bg-red-600 text-white py-2 rounded w-full">Grubu Sil</button>
        </div>
      </div>
    </div>
  );
}
