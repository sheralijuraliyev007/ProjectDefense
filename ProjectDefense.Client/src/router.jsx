import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';
import ErrorBoundary from './components/shared/ErrorBoundary';


import MainPage from './pages/public/MainPage';
import PositionPublicPage from './pages/public/PositionPublicPage';
import NotFoundPage from './pages/public/NotFoundPage';


import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import GithubCallbackPage from './pages/auth/GithubCallbackPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';


import CVEditPage from './pages/candidate/CVEditPage';
import ProfilePage from './pages/candidate/ProfilePage';



import PositionsPage from './pages/recruiter/PositionsPage';
import PositionDetailPage from './pages/recruiter/PositionDetailPage';
import AttributeLibraryPage from './pages/recruiter/AttributeLibraryPage';


import UsersPage from './pages/admin/UsersPage';
import DashboardPage from './pages/admin/DashboardPage';


import ProtectedRoute from './components/shared/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      
      { index: true, element: <MainPage /> },
      { path: 'positions', element: <PositionPublicPage /> },
      { path: 'positions/:id', element: <PositionPublicPage /> },
      
      
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'auth/github/callback', element: <GithubCallbackPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
      
      
      {
        path: 'profile',
        element: <ProtectedRoute allowedRoles={['Candidate', 'Administrator']} />,
        children: [
          { index: true, element: <ProfilePage /> },
        ]
      },

      
      {
          path: 'candidate',
          element: <ProtectedRoute allowedRoles={['Candidate', 'Administrator']} />,
          children: [
              { path: 'cv/:cvId/edit', element: <CVEditPage /> },
          ]
      },
      
      {
        path: 'recruiter',
        element: <ProtectedRoute allowedRoles={['Recruiter', 'Administrator']} />,
        children: [
          { path: 'positions', element: <PositionsPage /> },
          { path: 'positions/:id', element: <PositionDetailPage /> },
          { path: 'attributes', element: <AttributeLibraryPage /> },
        ]
      },
      
      
      {
  path: 'admin',
  element: <ProtectedRoute allowedRoles={['Administrator']} />,
  children: [
    { path: 'users', element: <UsersPage /> },
    { path: 'users/:userId/profile', element: <ProfilePage /> },   
    { path: 'dashboard', element: <DashboardPage /> },
  ]
},
      
      { path: '*', element: <NotFoundPage /> },
    ]
  }
]);

export default router;