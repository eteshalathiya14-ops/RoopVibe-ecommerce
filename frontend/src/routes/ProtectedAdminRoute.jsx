import { Navigate } from 'react-router-dom';

export default function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem('roopvibe_admin_token');
  
  // Token exist karta hai aur valid JWT format hai
  if (!token || token.split('.').length !== 3) {
    localStorage.removeItem('roopvibe_admin_token'); // stale token clean karo
    return <Navigate to="/login" replace />;
  }
  
  return children;
}