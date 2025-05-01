import AppRouter from './router/AppRouter';
import { AuthProvider } from './hooks/useAuth';

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
