import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchTeacherCourseStats } from '../../api/analyticsApi';
import { getApiErrorMessage } from '../../utils/apiError';
import StatsTable from '../../components/analytics/StatsTable';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function TeacherCourseAnalytics() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [forbidden, setForbidden] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError('');
                setForbidden(false);
                const data = await fetchTeacherCourseStats(courseId);
                if (!cancelled) setStats(data);
            } catch (err) {
                if (!cancelled) {
                    if (err.response?.status === 403) {
                        setForbidden(true);
                    } else {
                        setError(getApiErrorMessage(err));
                    }
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [courseId]);

    if (loading) return <LoadingSpinner message="Loading course analytics..." />;

    if (forbidden) {
        return (
            <div className="page-container">
                <div className="alert alert-error">You don&apos;t have access to this course.</div>
                <button type="button" className="btn btn-secondary mt-4" onClick={() => navigate(-1)}>
                    ← Go Back
                </button>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="alert alert-error">{error}</div>
                <button type="button" className="btn btn-secondary mt-4" onClick={() => navigate(-1)}>
                    ← Go Back
                </button>
            </div>
        );
    }

    const allZero = stats.students.every(
        (s) => s.questionsAttempted === 0 && s.correctCount === 0 && s.wrongCount === 0
    );

    return (
        <div className="page-container animate-fade-in">
            <button
                type="button"
                className="text-sm font-medium text-[var(--primary)] hover:underline"
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            <div className="page-header mt-2">
                <div>
                    <h1 className="page-title">{stats.courseTitle}</h1>
                    <p className="page-subtitle">
                        {stats.totalEnrolledStudents} enrolled student
                        {stats.totalEnrolledStudents !== 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    to={`/teacher/courses/${courseId}/leaderboard`}
                    className="btn btn-outline"
                >
                    Leaderboard
                </Link>
            </div>

            {stats.students.length === 0 ? (
                <EmptyState
                    title="No students enrolled"
                    description="Students will appear here once they join your classroom."
                    icon="👥"
                />
            ) : allZero ? (
                <>
                    <EmptyState
                        title="No quiz attempts yet"
                        description="Analytics will populate after students complete quizzes."
                        icon="📊"
                    />
                    <div className="mt-8">
                        <StatsTable students={stats.students} />
                    </div>
                </>
            ) : (
                <StatsTable students={stats.students} />
            )}
        </div>
    );
}
