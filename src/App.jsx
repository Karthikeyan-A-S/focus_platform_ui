import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ClassroomManager from './pages/teacher/ClassroomManager'; // <-- NEW IMPORT
import StudentDashboard from './pages/student/StudentDashboard';
import CoursePlayer from './pages/student/CoursePlayer';

// Route Firewall
const ProtectedRoute = ({ children, allowedRole }) => {
    // 1. Grab 'loading' from the context
    const { user, loading } = useContext(AuthContext);
    
    // 2. THE FIX: If we are still checking local storage, show a loading screen instead of kicking them out!
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl font-bold text-gray-500">Verifying session...</p>
            </div>
        );
    }
    
    // 3. Once loading is false, THEN we check if they are allowed in
    if (!user) return <Navigate to="/login" />;
    if (user.role !== allowedRole) return <Navigate to="/login" />; 
    
    return children;
};
export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                {/* Everything inside MainLayout gets the Navbar automatically! */}
                <MainLayout>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        {/* TEACHER ROUTES */}
                        <Route path="/teacher/dashboard" element={
                            <ProtectedRoute allowedRole="TEACHER">
                                <TeacherDashboard />
                            </ProtectedRoute>
                        } />
                        
                        {/* <-- NEW ROUTE: This handles the "Manage Course" button click! */}
                        <Route path="/teacher/classroom/:classroomId" element={
                            <ProtectedRoute allowedRole="TEACHER">
                                <ClassroomManager />
                            </ProtectedRoute>
                        } />
                        
                        {/* STUDENT ROUTES */}
                        <Route path="/student/dashboard" element={
                            <ProtectedRoute allowedRole="STUDENT">
                                <StudentDashboard />
                            </ProtectedRoute>
                        } />

                        <Route path="/student/course/:courseId" element={
                            <ProtectedRoute allowedRole="STUDENT">
                                <CoursePlayer />
                            </ProtectedRoute>
                        } />

                        {/* CATCH ALL */}
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                </MainLayout>
            </BrowserRouter>
        </AuthProvider>
    );
}