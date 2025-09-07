import { useState, useEffect } from 'react';
import { FaUserAstronaut, FaEnvelope, FaUser, FaCrown } from 'react-icons/fa';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get user data from localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('User not logged in');
      }
      
      const userData = JSON.parse(storedUser);
      const email = userData.email;
      
      if (!email) {
        throw new Error('User email not found');
      }

      const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch users`);
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    return role === 'admin' ? <FaCrown size={16} color="#f59e0b" /> : <FaUser size={16} color="#6b7280" />;
  };

  const getRoleBadgeColor = (role) => {
    return role === 'admin' 
      ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading users...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '20px'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626'
        }}>
          <p style={{ margin: 0, fontSize: '16px' }}>Error: {error}</p>
        </div>
        <button
          onClick={fetchUsers}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <div style={{
          padding: '12px',
          backgroundColor: '#eff6ff',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FaUserAstronaut size={32} color="#3b82f6" />
        </div>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0,
            marginBottom: '4px'
          }}>
            User Management
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: 0
          }}>
            Manage all registered users and their roles
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          padding: '24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <FaUser size={20} color="#6b7280" />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
              Total Users
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            {users.length}
          </p>
        </div>
        
        <div style={{
          padding: '24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <FaCrown size={20} color="#f59e0b" />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
              Admins
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            {users.filter(user => user.role === 'admin').length}
          </p>
        </div>
        
        <div style={{
          padding: '24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <FaUser size={20} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
              Regular Users
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            {users.filter(user => user.role === 'user').length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            All Users
          </h2>
        </div>

        {users.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <FaUserAstronaut size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
            <p style={{ margin: 0, fontSize: '16px' }}>No users found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    User
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Email
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Role
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id || index} style={{
                    borderBottom: index < users.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}>
                    <td style={{
                      padding: '16px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: user.role === 'admin' ? '#fef3c7' : '#eff6ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getRoleIcon(user.role)}
                      </div>
                      <div>
                        <p style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: '500',
                          color: '#1f2937'
                        }}>
                          {user.name || 'Unknown User'}
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          ID: {user.id || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td style={{
                      padding: '16px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <FaEnvelope size={16} color="#6b7280" />
                      <span style={{ fontSize: '14px', color: '#374151' }}>
                        {user.email || 'No email'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        border: '1px solid',
                        ...(user.role === 'admin' 
                          ? { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fbbf24' }
                          : { backgroundColor: '#eff6ff', color: '#1e40af', borderColor: '#93c5fd' }
                        )
                      }}>
                        {getRoleIcon(user.role)}
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
