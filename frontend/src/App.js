import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import TourViewer from './pages/TourViewer';
import Login from './pages/Login';
import Admin from './pages/Admin';
import SceneManager from './pages/admin/SceneManager';
import HotspotManager from './pages/admin/HotspotManager';
import PanoramaEditor from './pages/admin/PanoramaEditor';
import DenahManager from './pages/admin/DenahManager';
import Denah from './pages/Denah';
import ManageUsers from './pages/admin/ManageUsers';
import ActivityLog from './pages/admin/ActivityLog';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute, { SuperAdminRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/tour" element={<TourViewer />} />
          <Route path="/denah" element={<Denah />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Admin />} />
            <Route path="scenes" element={<SceneManager />} />
            <Route path="hotspots" element={<HotspotManager />} />
            <Route path="editor" element={<PanoramaEditor />} />
            <Route path="denah" element={<DenahManager />} />
            <Route path="activity" element={<SuperAdminRoute><ActivityLog /></SuperAdminRoute>} />
            <Route path="users" element={<SuperAdminRoute><ManageUsers /></SuperAdminRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
