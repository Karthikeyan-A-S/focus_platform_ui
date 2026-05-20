import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
            const response = await api.get('/student/my-classrooms');
            setClassrooms(response.data);
        } catch (err) {
            console.error('Failed to load classrooms', err);
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
            fetchMyClassrooms();
        } catch {
            setError('Invalid invite code or you are already enrolled.');
        }
    };

    if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Learning Dashboard</h1>
                    <p className="page-subtitle">Enroll in classrooms and track your progress</p>
                </div>
                <Link to="/student/analytics" className="btn btn-outline">
                    View Analytics
                </Link>
            </div>

            <div className="card mb-8">
                <form onSubmit={handleEnroll} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                        className="input-field sm:max-w-xs"
                        placeholder="Enter invite code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn" style={{ background: 'var(--success)' }}>
                        Enroll in Classroom
                    </button>
                </form>
                {error && <p className="mt-3 text-sm font-medium text-[var(--danger)]">{error}</p>}
            </div>

            {classrooms.length === 0 ? (
                <div className="card text-center py-12 text-[var(--text-muted)]">
                    You haven&apos;t enrolled in any classrooms yet. Enter an invite code above to start!
                </div>
            ) : (
                classrooms.map((classroom) => (
                    <section key={classroom.id} className="mb-10">
                        <h2 className="mb-4 border-b border-[var(--border)] pb-2 text-2xl font-bold text-[var(--primary)]">
                            {classroom.name}
                            <span className="ml-3 text-sm font-normal text-[var(--text-muted)]">
                                Instructor: {classroom.teacher?.name}
                            </span>
                        </h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {classroom.courses?.length > 0 ? (
                                classroom.courses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="card flex flex-col justify-between"
                                    >
                                        <div>
                                            <h3 className="mb-2 text-xl font-bold">{course.title}</h3>
                                            <p className="mb-4 line-clamp-3 text-sm text-[var(--text-muted)]">
                                                {course.description}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                type="button"
                                                className="btn w-full"
                                                onClick={() => navigate(`/student/course/${course.id}`)}
                                            >
                                                Start Learning
                                            </button>
                                            <Link
                                                to={`/student/course/${course.id}/leaderboard`}
                                                className="btn btn-outline w-full text-center"
                                            >
                                                Leaderboard
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="italic text-[var(--text-muted)]">
                                    No courses published in this classroom yet.
                                </p>
                            )}
                        </div>
                    </section>
                ))
            )}
        </div>
    );
}
