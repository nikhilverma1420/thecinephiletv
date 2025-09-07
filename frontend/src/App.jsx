import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Trending from './pages/Trending';
import Library from './pages/Library';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Users from './pages/Users';
import './App.css';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Sidebar />
        <div style={{ marginLeft: '80px', padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/library" element={<Library />} />
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute requiredRole="admin">
                <Upload />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute requiredRole="admin">
                <Users />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
