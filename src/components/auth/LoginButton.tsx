import { useAuth } from "../../contexts/AuthContext";

export default function LoginButton() {
  const { user, loginWithGoogle, logout } = useAuth();

  return (
    <button
      onClick={user ? logout : loginWithGoogle}
      className="px-4 py-2 font-semibold text-sm bg-primary text-white rounded-lg shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      {user ? 'Sign Out' : 'Sign in with Google'}
    </button>
  );
} 