import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { fetchStudentAnalytics } from '../../api/analyticsApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SearchContext } from '../../context/SearchContext'; // NEW: Imported SearchContext

export default function StudentDashboard() {
    const [classrooms, setClassrooms] = useState([]);
    const [completedCourseIds, setCompletedCourseIds] = useState(new Set());
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalUnreadCounts, setTotalUnreadCounts] = useState({});

    const navigate = useNavigate();
    
    // NEW: Bring in the search query from Context
    const { searchQuery } = useContext(SearchContext);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Live polling for chat notification badges
    useEffect(() => {
        if (classrooms.length === 0) return;

        const fetchAllUnreadCounts = async () => {
            const counts = {};
            for (const cls of classrooms) {
                try {
                    const res = await api.get(`/chat/unread-total?targetType=CLASSROOM&targetId=${cls.id}`);
                    counts[cls.id] = res.data;
                } catch (e) {
                    console.error("Failed to fetch unread count", e);
                }
            }
            setTotalUnreadCounts(counts);
        };

        const intervalId = setInterval(fetchAllUnreadCounts, 10000); // 10 seconds
        return () => clearInterval(intervalId);
    }, [classrooms]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [classroomsRes, analyticsRes] = await Promise.all([
                api.get('/student/my-classrooms'),
                fetchStudentAnalytics().catch(() => null)
            ]);

            setClassrooms(classroomsRes.data);

            if (analyticsRes && analyticsRes.byCourse) {
                const completedIds = analyticsRes.byCourse.map(c => c.courseId);
                setCompletedCourseIds(new Set(completedIds));
            }
        } catch (err) {
            console.error('Failed to load dashboard data', err);
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
            fetchDashboardData();
        } catch {
            setError('Invalid invite code or you are already enrolled.');
        }
    };

    // --- NEW: Dynamic Nested Search Filtering ---
    const filteredClassrooms = classrooms.map(classroom => {
        const query = (searchQuery || "").toLowerCase().trim();
        
        // If no search query, return the classroom normally
        if (!query) return classroom;

        // 1. Check if the classroom name itself matches the search
        const isClassroomMatch = classroom.name.toLowerCase().includes(query);

        // 2. Filter the courses inside this specific classroom
        const matchedCourses = classroom.courses?.filter(course => 
            course.title.toLowerCase().includes(query) || 
            (course.description && course.description.toLowerCase().includes(query))
        ) || [];

        // 3. Return logic
        if (isClassroomMatch) {
            return classroom; // Return classroom with ALL courses
        } else if (matchedCourses.length > 0) {
            return { ...classroom, courses: matchedCourses }; // Return classroom with ONLY matching courses
        }

        return null; // Drop classroom if nothing matches
    }).filter(Boolean); // Clean out the nulls

    if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">My Learning Dashboard</h1>
                    <p className="page-subtitle">Enroll in classrooms and track your progress</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/student/analytics" className="btn btn-outline text-[var(--primary)] border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors">
                        View Analytics
                    </Link>
                </div>
            </div>

            <div className="card mb-8 bg-[var(--surface)] border border-[var(--border)]">
                <form onSubmit={handleEnroll} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                        className="input-field sm:max-w-xs bg-[var(--background)] text-[var(--text)] border-[var(--border)]"
                        placeholder="Enter invite code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn" style={{ background: 'var(--success)', color: '#fff' }}>
                        Enroll in Classroom
                    </button>
                </form>
                {error && <p className="mt-3 text-sm font-medium text-[var(--danger)]">{error}</p>}
            </div>

            {/* Render Logic: Check empty state, then check search state, then map results */}
            {classrooms.length === 0 ? (
                <div className="card text-center py-12 text-[var(--text-muted)] border border-[var(--border)] bg-[var(--surface)]">
                    You haven&apos;t enrolled in any classrooms yet. Enter an invite code above to start!
                </div>
            ) : filteredClassrooms.length === 0 ? (
                <div className="card text-center py-12 text-[var(--text-muted)] border border-[var(--border)] bg-[var(--surface)]">
                    No classrooms or courses match your search for "{searchQuery}".
                </div>
            ) : (
                filteredClassrooms.map((classroom) => (
                    <section key={classroom.id} className="mb-10">
                        {/* Classroom Header */}
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-2">
                            <h2 className="text-2xl font-bold text-[var(--primary)]">
                                {classroom.name}
                                <span className="ml-3 text-sm font-normal text-[var(--text-muted)] block sm:inline">
                                    Instructor: {classroom.teacher?.name}
                                </span>
                            </h2>
                            
                            {/* Class Chat Button with Red Badge */}
                            <button
                                type="button"
                                className="btn btn-sm relative bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--border)] border border-[var(--border)]"
                                onClick={() => navigate(`/chat/CLASSROOM/${classroom.id}`)}
                            >
                                💬 Class Chat
                                {totalUnreadCounts[classroom.id] > 0 && (
                                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                        {totalUnreadCounts[classroom.id] > 99 ? '99+' : totalUnreadCounts[classroom.id]}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Courses Grid */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {classroom.courses?.length > 0 ? (
                                classroom.courses.map((course) => {
                                    const isCompleted = completedCourseIds.has(course.id);

                                    return (
                                        <div
                                            key={course.id}
                                            className={`card flex flex-col justify-between bg-[var(--surface)] border border-[var(--border)] transition-all hover:shadow-md ${
                                                isCompleted ? 'border-l-4 border-l-[var(--success)]' : ''
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="text-xl font-bold text-[var(--text)]">{course.title}</h3>
                                                    {isCompleted && (
                                                        <span className="badge bg-[var(--success)]/10 text-[var(--success)] text-xs ml-2 px-2 py-1 rounded-full whitespace-nowrap">
                                                            ✅ Completed
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mb-4 line-clamp-3 text-sm text-[var(--text-muted)]">
                                                    {course.description}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2 mt-4">
                                                <button
                                                    type="button"
                                                    className={`btn w-full ${isCompleted ? 'bg-[var(--border)] text-[var(--text)] hover:bg-[var(--text-muted)]/20' : 'bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90'}`}
                                                    onClick={() => navigate(`/student/course/${course.id}`)}
                                                >
                                                    {isCompleted ? 'Review Course' : 'Start Learning'}
                                                </button>
                                                <Link
                                                    to={`/student/course/${course.id}/leaderboard`}
                                                    className="btn w-full text-center border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)]"
                                                >
                                                    Leaderboard
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="italic text-[var(--text-muted)] col-span-full">
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