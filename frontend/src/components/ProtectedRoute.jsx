import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = 'admin' }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          if (userData.role !== requiredRole) {
            navigate('/');
            return;
          }
        } else {
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem('user');
        navigate('/');
        return;
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== requiredRole) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
