import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Users from './pages/Users.jsx';
import AiHistory from './pages/AiHistory.jsx';
import Uploads from './pages/Uploads.jsx';
import Notifications from './pages/Notifications.jsx';
import Settings from './pages/Settings.jsx';
import ApiKeys from './pages/ApiKeys.jsx';
import ActivityLogs from './pages/ActivityLogs.jsx';
import Analytics from './pages/Analytics.jsx';
import ThemeSettings from './pages/ThemeSettings.jsx';
import ModelSettings from './pages/ModelSettings.jsx';
import PromptSettings from './pages/PromptSettings.jsx';
import Banners from './pages/Banners.jsx';
import AdsConfig from './pages/AdsConfig.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/ai-history" element={<AiHistory />} />
        <Route path="/uploads" element={<Uploads />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/api-keys" element={<ApiKeys />} />
        <Route path="/activity-logs" element={<ActivityLogs />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/theme-settings" element={<ThemeSettings />} />
        <Route path="/model-settings" element={<ModelSettings />} />
        <Route path="/prompt-settings" element={<PromptSettings />} />
        <Route path="/banners" element={<Banners />} />
        <Route path="/ads" element={<AdsConfig />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
