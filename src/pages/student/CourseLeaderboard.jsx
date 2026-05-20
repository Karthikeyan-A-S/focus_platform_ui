import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchCourseLeaderboard } from '../../api/analyticsApi';
import { getApiErrorMessage } from '../../utils/apiError';
import Leaderboard from '../../components/analytics/Leaderboard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CourseLeaderboard() {
    const { courseId } = useParams();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError('');
                const data = await fetchCourseLeaderboard(courseId);
                if (!cancelled) setEntries(data);
            } catch (err) {
                if (!cancelled) setError(getApiErrorMessage(err));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [courseId]);

    return (
        <div className="page-container animate-fade-in">
            <Link to="/student/dashboard" className="text-sm font-medium text-[var(--primary)] hover:underline">
                ← Dashboard
            </Link>
            <h1 className="page-title mt-2">Course Leaderboard</h1>

            {loading && <LoadingSpinner message="Loading leaderboard..." />}
            {error && <div className="alert alert-error mt-4">{error}</div>}
            {!loading && !error && <Leaderboard entries={entries} />}
        </div>
    );
}
