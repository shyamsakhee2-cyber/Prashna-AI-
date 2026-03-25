import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';

export const Auth = () => {
  const [user, loading] = useAuthState(auth);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4 bg-white p-2 pr-4 rounded-full border border-slate-100 shadow-sm">
        <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-orange-200" />
        <div className="hidden sm:block text-xs font-semibold text-slate-700">{user.displayName}</div>
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full shadow-lg shadow-orange-100 transition-all"
    >
      <LogIn className="w-4 h-4" />
      <span>Sign In with Google</span>
    </button>
  );
};
