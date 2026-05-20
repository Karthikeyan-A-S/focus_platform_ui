import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStudentAnalytics } from '../../api/analyticsApi';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDuration } from '../../utils/formatTime';
import SummaryCards from '../../components/analytics/SummaryCards';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function StudentAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError('');
                const result = await fetchStudentAnalytics();
                if (!cancelled) setData(result);
            } catch (err) {
                if (!cancelled) setError(getApiErrorMessage(err));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (loading) return <LoadingSpinner message="Loading your analytics..." />;
    if (error) {
        return (
            <div className="page-container">
                <div className="alert alert-error">{error}</div>
                <Link to="/student/dashboard" className="btn btn-secondary mt-4">← Dashboard</Link>
            </div>
        );
    }

    const isEmpty =
        data.totalQuestionsAttempted === 0 &&
        data.totalCorrect === 0 &&
        data.totalWrong === 0;

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <div>
                    <Link to="/student/dashboard" className="text-sm font-medium text-[var(--primary)] hover:underline">
                        ← Dashboard
                    </Link>
                    <h1 className="page-title mt-2">My Analytics</h1>
                    <p className="page-subtitle">Your quiz performance across all courses</p>
                </div>
            </div>

            {isEmpty ? (
                <EmptyState
                    title="Complete a quiz to see your analytics."
                    description="Finish at least one course quiz to track attempts, accuracy, and time."
                    icon="📈"
                />
            ) : (
                <>
                    <SummaryCards
                        attempted={data.totalQuestionsAttempted}
                        correct={data.totalCorrect}
                        wrong={data.totalWrong}
                        timeMs={data.totalTimeMs}
                    />

                    {data.byCourse?.length > 0 && (
                        <section className="mt-10">
                            <h2 className="mb-4 text-xl font-bold text-[var(--text)]">By Course</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {data.byCourse.map((course) => (
                                    <div
                                        key={course.courseId}
                                        className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm"
                                    >
                                        <h3 className="text-lg font-bold text-[var(--text)]">{course.courseTitle}</h3>
                                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-[var(--text-muted)]">Attempted</span>
                                                <p className="font-semibold">{course.questionsAttempted}</p>
                                            </div>
                                            <div>
                                                <span className="text-[var(--text-muted)]">Correct</span>
                                                <p className="font-semibold text-[var(--success)]">{course.correctCount}</p>
                                            </div>
                                            <div>
                                                <span className="text-[var(--text-muted)]">Wrong</span>
                                                <p className="font-semibold text-[var(--danger)]">{course.wrongCount}</p>
                                            </div>
                                            <div>
                                                <span className="text-[var(--text-muted)]">Solved</span>
                                                <p className="font-semibold">{course.problemsSolved}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-[var(--text-muted)]">Time</span>
                                                <p className="font-semibold">{formatDuration(course.totalTimeMs)}</p>
                                            </div>
                                        </div>
                                        <Link
                                            to={`/student/course/${course.courseId}/leaderboard`}
                                            className="btn btn-outline mt-4 w-full text-center"
                                        >
                                            View Leaderboard
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}
