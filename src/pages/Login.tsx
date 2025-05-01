import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient';
import '../styles/Login.css';

export default function LoginPage() {
  const { user, signIn, signOutUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetPanel, setShowResetPanel] = useState(false);

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('is_verified')
            .eq('id', user.id)
            .single();
  
          if (error || !data) {
            toast.error('Kullanıcı doğrulaması yapılamadı.');
            await signOutUser();
            return;
          }
  
          if (!data.is_verified) {
            toast.error('Üyeliğiniz henüz onaylanmamış.');
            await signOutUser();
            return;
          }
  
          // 🔥 Doğrulandıysa buradan yönlendir
          const normalizedEmail = user.email?.trim().toLowerCase() || '';
          if (normalizedEmail === 'blu4ck@outlook.com') {
            navigate('/admin');
          } else {
            navigate('/main');
          }
  
        } catch (err) {
          console.error('Kullanıcı kontrol hatası:', err);
          await signOutUser();
          navigate('/login');
        }
      })();
    }
  }, [user, navigate, signOutUser]);
  

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      toast.success('Giriş başarılı!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Giriş başarısız.';
      console.error('Login error:', message);
      toast.error(message);
    }
  };

  const handleSendPassword = async () => {
    if (!email) {
      toast.error('Lütfen email adresinizi girin.');
      return;
    }
    try {
      const { error } = await supabase.functions.invoke('reset-user-password', {
        body: { email }
      });
      if (error) {
        console.error('Şifre sıfırlama hatası:', error.message);
        toast.error('Şifre sıfırlama başarısız.');
        return;
      }
      toast.success('Yeni şifre email adresinize gönderildi.');
      setShowResetPanel(false); // Başarılıysa geri login ekranına dön
    } catch {
      toast.error('Bir hata oluştu.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <img src="/lexinote-logo.png" alt="Lexinote Logo" className="login-logo" />

        {/* Normal Login Form */}
        {!showResetPanel && (
          <div className="fade-in">
            <input
              type="email"
              placeholder="Email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Şifre"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button onClick={handleLogin} className="btn btn-soft">Login</button>

            <button onClick={() => setShowResetPanel(true)} className="btn btn-link">
              Şifremi Unuttum
            </button>
          </div>
        )}

        {/* Password Reset Panel */}
        {showResetPanel && (
          <div className="fade-in">
            <input
              type="email"
              placeholder="Email adresinizi girin"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button onClick={handleSendPassword} className="btn btn-soft">Şifreyi Sıfırla</button>

            <button onClick={() => setShowResetPanel(false)} className="btn btn-link">
              ← Geri
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
