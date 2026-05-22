import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useContext } from 'react';

import MainLayout from './components/layout/MainLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ClassroomManager from './pages/teacher/ClassroomManager';
import TeacherCourseAnalytics from './pages/teacher/TeacherCourseAnalytics';
import TeacherCourseLeaderboard from './pages/teacher/TeacherCourseLeaderboard';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAnalytics from './pages/student/StudentAnalytics';
import CoursePlayer from './pages/student/CoursePlayer';
import CourseLeaderboard from './pages/student/CourseLeaderboard';
import Profile from './pages/Profile'; // Adjust the import path as needed
import UserProfile from './pages/UserProfile'; // Import it at the top
import { ChatProvider } from './context/ChatProvider';
import ChatPage from './pages/ChatPage'; // Ensure you import it at the top!
const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <LoadingSpinner message="Verifying session..." />;
    }

    if (!user) return <Navigate to="/login" />;
    if (user.role !== allowedRole) return <Navigate to="/login" />;

    return children;
};

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ChatProvider>
                <BrowserRouter>
                    <MainLayout>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            <Route
                                path="/teacher/dashboard"
                                element={
                                    <ProtectedRoute allowedRole="TEACHER">
                                        <TeacherDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/teacher/classroom/:classroomId"
                                element={
                                    <ProtectedRoute allowedRole="TEACHER">
                                        <ClassroomManager />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/teacher/courses/:courseId/analytics"
                                element={
                                    <ProtectedRoute allowedRole="TEACHER">
                                        <TeacherCourseAnalytics />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/teacher/courses/:courseId/leaderboard"
                                element={
                                    <ProtectedRoute allowedRole="TEACHER">
                                        <TeacherCourseLeaderboard />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/student/dashboard"
                                element={
                                    <ProtectedRoute allowedRole="STUDENT">
                                        <StudentDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/student/analytics"
                                element={
                                    <ProtectedRoute allowedRole="STUDENT">
                                        <StudentAnalytics />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/student/course/:courseId"
                                element={
                                    <ProtectedRoute allowedRole="STUDENT">
                                        <CoursePlayer />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/student/course/:courseId/leaderboard"
                                element={
                                    <ProtectedRoute allowedRole="STUDENT">
                                        <CourseLeaderboard />
                                    </ProtectedRoute>
                                }
                            />

                            <Route path="*" element={<Navigate to="/login" />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/profile/:id" element={<UserProfile />} />
                            <Route path="/chat/:targetType/:targetId" element={<ChatPage />} />
                        </Routes>
                    </MainLayout>
                </BrowserRouter>
                </ChatProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
