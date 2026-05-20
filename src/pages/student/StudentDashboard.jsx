import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function StudentDashboard() {
    const [classrooms, setClassrooms] = useState([]);
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchMyClassrooms();
    }, []);

    const fetchMyClassrooms = async () => {
        try {
            setLoading(true);
            // We will add this quick endpoint to your backend below!
            const response = await api.get('/student/my-classrooms');
            setClassrooms(response.data);
        } catch (error) {
            console.error("Failed to load classrooms", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/student/enroll', { inviteCode });
            setInviteCode('');
            fetchMyClassrooms(); // Refresh the list
        } catch (err) {
            setError('Invalid invite code or you are already enrolled.');
        }
    };

    if (loading) return <div className="p-6">Loading your dashboard...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">My Learning Dashboard</h1>
                
                {/* Enrollment Form */}
                <form onSubmit={handleEnroll} className="flex gap-2">
                    <input 
                        className="input-field w-48" 
                        placeholder="Enter Invite Code" 
                        value={inviteCode} 
                        onChange={(e) => setInviteCode(e.target.value)} 
                        required 
                    />
                    <button type="submit" className="btn bg-green-600">Enroll</button>
                </form>
            </div>
            {error && <p className="text-red-500 mb-4 font-bold">{error}</p>}

            {/* Display Classrooms and their Courses */}
            {classrooms.length === 0 ? (
                <div className="card text-center py-12 text-gray-500">
                    You haven't enrolled in any classrooms yet. Enter an invite code above to start!
                </div>
            ) : (
                classrooms.map(classroom => (
                    <div key={classroom.id} className="mb-10">
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-blue-900">
                            {classroom.name} 
                            <span className="text-sm font-normal text-gray-500 ml-3">Instructor: {classroom.teacher?.name}</span>
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {classroom.courses && classroom.courses.length > 0 ? (
                                classroom.courses.map(course => (
                                    <div key={course.id} className="card hover:shadow-lg transition-shadow flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                                            <p className="text-gray-600 text-sm line-clamp-3 mb-6">{course.description}</p>
                                        </div>
                                        <button 
                                            className="btn w-full bg-blue-600"
                                            onClick={() => navigate(`/student/course/${course.id}`)}
                                        >
                                            Start Learning
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No courses published in this classroom yet.</p>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}