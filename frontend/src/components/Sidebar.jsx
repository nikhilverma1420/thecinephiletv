import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GiHamburgerMenu } from "react-icons/gi";
import { HiHome } from "react-icons/hi";
import { AiFillFire } from "react-icons/ai";
import { IoLibrary } from "react-icons/io5";
import { MdCloudUpload } from "react-icons/md";
import { BiSolidDashboard } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { FaUserAstronaut } from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const location = useLocation();

  // Check for stored login data on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setUserName(userData.name);
        setUserRole(userData.role);
        console.log('Restored user from localStorage:', userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Function to clear user data
  const clearUserData = () => {
    setIsLoggedIn(false);
    setUserName('');
    setUserRole('');
    localStorage.removeItem('user');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleLoginSignup = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', confirmPassword: '', name: '' });
  };

  const handleLogout = () => {
    clearUserData();
    setIsProfileOpen(false);
    console.log('User logged out and localStorage cleared');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        // Login API call
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          setIsLoggedIn(true);
          setUserName(data.user.name);
          setUserRole(data.user.role);
          console.log('User role:', data.user.role); // Debug log
          
          // Store user data in localStorage for persistence
          const userData = {
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            id: data.user.id
          };
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('User data stored in localStorage:', userData);
          
          setIsProfileOpen(false);
          setFormData({ email: '', password: '', confirmPassword: '', name: '' });
        } else {
          alert(data.message || 'Login failed');
        }
      } else {
        // Signup API call
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match!');
          return;
        }

        const response = await fetch('/api/registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword
          })
        });

        const data = await response.json();

        if (response.ok) {
          setIsLoggedIn(true);
          setUserName(data.user.name);
          setUserRole(data.user.role);
          
          // Store user data in localStorage for persistence
          const userData = {
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            id: data.user.id
          };
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('New user data stored in localStorage:', userData);
          
          setIsProfileOpen(false);
          setFormData({ email: '', password: '', confirmPassword: '', name: '' });
        } else {
          alert(data.message || 'Signup failed');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please try again.');
      // Clear user data if there's a network error
      clearUserData();
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const sidebarStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '15%',
    backgroundColor: 'white',
    borderRight: '2px solid black',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    transform: isOpen ? 'translateX(0) scale(1)' : 'translateX(-100%) scale(0.95)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 40,
    opacity: isOpen ? 1 : 0
  };

  const buttonStyles = {
    position: 'fixed',
    top: '16px',
    left: isOpen ? 'calc(7.5% - 12px)' : '16px', // Center horizontally in sidebar
    zIndex: 50,
    padding: '0',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'left 0.3s ease-in-out'
  };

  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 35
  };

  const profilePopupStyles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(50vw, 500px)',
    minHeight: '50vh',
    maxHeight: '90vh',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    zIndex: 60,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    overflow: 'auto'
  };

  return (
    <div>
      {/* Profile Button - Top Right Corner */}
      <div style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}>
        <button
          onClick={toggleProfile}
          style={{
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Toggle profile"
        >
          <CgProfile size={24} color="#374151" />
        </button>
        
        {/* Floating Text */}
        <div style={{
          fontSize: '12px',
          color: isLoggedIn ? '#10b981' : '#6b7280',
          fontWeight: '500',
          textAlign: 'center',
          animation: isLoggedIn ? 'none' : 'float 2s ease-in-out infinite',
          opacity: 0.8
        }}>
          {isLoggedIn ? `${userName} ✓` : 'Login'}
        </div>
      </div>

      {/* Profile Popup Overlay */}
      {isProfileOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 55
          }}
          onClick={toggleProfile}
        />
      )}

      {/* Profile Popup */}
      {isProfileOpen && (
        <div style={profilePopupStyles}>
          {/* Close Button */}
          <button
            onClick={toggleProfile}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              zIndex: 61
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Close profile"
          >
            <IoClose size={24} color="#374151" />
          </button>

          {/* Content */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            flex: 1,
            paddingTop: '20px'
          }}>
            <CgProfile size={60} color="#374151" style={{ marginBottom: '20px' }} />
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              {isLoggedIn ? 'Profile' : (isLogin ? 'Login' : 'Sign Up')}
            </h2>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '14px', 
              textAlign: 'center',
              marginBottom: '30px',
              maxWidth: '300px'
            }}>
              {isLoggedIn ? `Welcome back, ${userName}!` : (isLogin ? 'Welcome back! Please sign in to your account.' : 'Create your account to get started.')}
            </p>
            {isLoggedIn && (
              <p style={{ 
                color: '#9ca3af', 
                fontSize: '12px', 
                textAlign: 'center',
                marginBottom: '20px',
                fontStyle: 'italic'
              }}>
                Role: {userRole || 'Loading...'}
              </p>
            )}

            {isLoggedIn ? (
              // Profile content when logged in
              <div style={{ width: '100%', maxWidth: '300px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                  {userRole === 'admin' && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        window.location.href = '/dashboard';
                      }}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#3b82f6';
                      }}
                    >
                      Dashboard
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ef4444';
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              // Login/Signup form when not logged in
              <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '300px' }}>
                {!isLogin && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151', 
                      marginBottom: '6px' 
                    }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required={!isLogin}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                )}

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#374151', 
                    marginBottom: '6px' 
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                {!isLogin && (
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151', 
                      marginBottom: '6px' 
                    }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required={!isLogin}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s',
                    marginBottom: '16px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                  }}
                >
                  {isLogin ? 'Login' : 'Sign Up'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                  </span>
                  <button
                    type="button"
                    onClick={toggleLoginSignup}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      textDecoration: 'underline'
                    }}
                  >
                    {isLogin ? 'Sign Up' : 'Login'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* When sidebar is closed - Show only icons vertically */}
      {!isOpen && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          zIndex: 50
        }}>
          <button
            onClick={toggleSidebar}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Toggle sidebar"
          >
            <GiHamburgerMenu size={24} color="#374151" />
          </button>
          <Link to="/" style={{ 
            padding: '8px',
            color: isActive('/') ? '#3b82f6' : '#374151', 
            textDecoration: 'none',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            backgroundColor: isActive('/') ? '#eff6ff' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.backgroundColor = isActive('/') ? '#dbeafe' : '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = isActive('/') ? '#eff6ff' : 'transparent';
          }}>
            <HiHome size={24} />
          </Link>
          
          {/* Show Trending and Library for normal users OR when admin is on home page */}
          {(!isLoggedIn || userRole !== 'admin' || location.pathname === '/') && (
            <>
              <Link to="/trending" style={{ 
                padding: '8px',
                color: isActive('/trending') ? '#3b82f6' : '#374151', 
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                backgroundColor: isActive('/trending') ? '#eff6ff' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.backgroundColor = isActive('/trending') ? '#dbeafe' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = isActive('/trending') ? '#eff6ff' : 'transparent';
              }}>
                <AiFillFire size={24} />
              </Link>
              <Link to="/library" style={{ 
                padding: '8px',
                color: isActive('/library') ? '#3b82f6' : '#374151', 
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                backgroundColor: isActive('/library') ? '#eff6ff' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.backgroundColor = isActive('/library') ? '#dbeafe' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = isActive('/library') ? '#eff6ff' : 'transparent';
              }}>
                <IoLibrary size={24} />
              </Link>
            </>
          )}
          
          {/* Show admin-only icons when admin is logged in */}
          {userRole === 'admin' && (
            <>
              <Link to="/dashboard" style={{ 
                padding: '8px',
                color: isActive('/dashboard') ? '#3b82f6' : '#374151', 
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                backgroundColor: isActive('/dashboard') ? '#eff6ff' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.backgroundColor = isActive('/dashboard') ? '#dbeafe' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = isActive('/dashboard') ? '#eff6ff' : 'transparent';
              }}>
                <BiSolidDashboard size={24} />
              </Link>
              <Link to="/upload" style={{ 
                padding: '8px',
                color: isActive('/upload') ? '#3b82f6' : '#374151', 
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                backgroundColor: isActive('/upload') ? '#eff6ff' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.backgroundColor = isActive('/upload') ? '#dbeafe' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = isActive('/upload') ? '#eff6ff' : 'transparent';
              }}>
                <MdCloudUpload size={24} />
              </Link>
              <Link to="/users" style={{ 
                padding: '8px',
                color: isActive('/users') ? '#3b82f6' : '#374151', 
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                backgroundColor: isActive('/users') ? '#eff6ff' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.backgroundColor = isActive('/users') ? '#dbeafe' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = isActive('/users') ? '#eff6ff' : 'transparent';
              }}>
                <FaUserAstronaut size={24} />
              </Link>
            </>
          )}
        </div>
      )}

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          style={overlayStyles}
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar - Only show when open */}
      {isOpen && (
        <div style={sidebarStyles}>
          {/* Menu Button in Sidebar */}
          <button
            onClick={toggleSidebar}
            style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(-50%) scale(1.1)';
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Toggle sidebar"
          >
            <GiHamburgerMenu size={24} color="#374151" />
          </button>

          {/* Sidebar Content */}
          <div style={{ padding: '24px', paddingTop: '80px' }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Link to="/" style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px', 
                color: isActive('/') ? '#3b82f6' : '#374151', 
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                backgroundColor: isActive('/') ? '#eff6ff' : 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.backgroundColor = isActive('/') ? '#dbeafe' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = isActive('/') ? '#eff6ff' : 'transparent';
              }}>
                <HiHome size={24} />
                <span>Home</span>
              </Link>
              
              {/* Show Trending and Library for normal users OR when admin is on home page */}
              {(!isLoggedIn || userRole !== 'admin' || location.pathname === '/') && (
                <>
                  <Link to="/trending" style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px', 
                    color: isActive('/trending') ? '#3b82f6' : '#374151', 
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    backgroundColor: isActive('/trending') ? '#eff6ff' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.backgroundColor = isActive('/trending') ? '#dbeafe' : '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = isActive('/trending') ? '#eff6ff' : 'transparent';
                  }}>
                    <AiFillFire size={24} />
                    <span>Trending</span>
                  </Link>
                  <Link to="/library" style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px', 
                    color: isActive('/library') ? '#3b82f6' : '#374151', 
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    backgroundColor: isActive('/library') ? '#eff6ff' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.backgroundColor = isActive('/library') ? '#dbeafe' : '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = isActive('/library') ? '#eff6ff' : 'transparent';
                  }}>
                    <IoLibrary size={24} />
                    <span>Library</span>
                  </Link>
                </>
              )}
              
              {/* Show admin-only navigation when admin is logged in */}
              {userRole === 'admin' && (
                <>
                  <Link to="/dashboard" style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px', 
                    color: isActive('/dashboard') ? '#3b82f6' : '#374151', 
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    backgroundColor: isActive('/dashboard') ? '#eff6ff' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.backgroundColor = isActive('/dashboard') ? '#dbeafe' : '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = isActive('/dashboard') ? '#eff6ff' : 'transparent';
                  }}>
                    <BiSolidDashboard size={24} />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/upload" style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px', 
                    color: isActive('/upload') ? '#3b82f6' : '#374151', 
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    backgroundColor: isActive('/upload') ? '#eff6ff' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.backgroundColor = isActive('/upload') ? '#dbeafe' : '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = isActive('/upload') ? '#eff6ff' : 'transparent';
                  }}>
                    <MdCloudUpload size={24} />
                    <span>Upload</span>
                  </Link>
                  <Link to="/users" style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px', 
                    color: isActive('/users') ? '#3b82f6' : '#374151', 
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    backgroundColor: isActive('/users') ? '#eff6ff' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.backgroundColor = isActive('/users') ? '#dbeafe' : '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = isActive('/users') ? '#eff6ff' : 'transparent';
                  }}>
                    <FaUserAstronaut size={24} />
                    <span>Users</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
