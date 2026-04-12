import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RequireAuth from './components/auth/RequireAuth';
import AdminLogin from './features/auth/AdminLogin';
import TeacherSignup from './features/auth/TeacherSignup';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LandingPage from './pages/LandingPage';
import TeacherInboxPage from './pages/TeacherInboxPage';
import TeacherKakaoCallbackPage from './pages/TeacherKakaoCallbackPage';
import TeacherLoginPage from './pages/TeacherLoginPage';
import TeacherSettingsPage from './pages/TeacherSettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/signup"
          element={
            <RequireAuth redirectTo="/teacher/login">
              <TeacherSignup />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth redirectTo="/admin">
              <AdminDashboardPage />
            </RequireAuth>
          }
        />
        <Route path="/teacher/login" element={<TeacherLoginPage />} />
        <Route path="/teacher/login/callback" element={<TeacherKakaoCallbackPage />} />
        <Route
          path="/teacher/inbox"
          element={
            <RequireAuth redirectTo="/teacher/login">
              <TeacherInboxPage />
            </RequireAuth>
          }
        />
        <Route
          path="/teacher/settings"
          element={
            <RequireAuth redirectTo="/teacher/login">
              <TeacherSettingsPage />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
