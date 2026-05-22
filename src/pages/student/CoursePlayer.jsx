import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { studentApi } from '../../api/studentApi';
import { fetchStudentAnalytics } from '../../api/analyticsApi'; // ✅ ADDED
import { getApiErrorMessage } from '../../utils/apiError';
import {
    parseQuestionOptions,
    letterForOptionIndex,
    getQuestionId
} from '../../utils/quizOptions';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CoursePlayer() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [view, setView] = useState('content');
    const [contents, setContents] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [hasCompleted, setHasCompleted] = useState(false);

    /** questionId -> 'A' | 'B' | 'C' | 'D' */
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        setAnswers({});
        setView('content');
        setHasCompleted(false);
        loadCourseData();
    }, [courseId]);

    const loadCourseData = async () => {
        try {
            setLoading(true);

            // ✅ FIX: Use fetchStudentAnalytics — same approach that works in StudentDashboard
            try {
                const analyticsRes = await fetchStudentAnalytics();
                if (analyticsRes && analyticsRes.byCourse) {
                    const isDone = analyticsRes.byCourse.some(
                        (c) => String(c.courseId) === String(courseId)
                    );
                    if (isDone) {
                        console.log("Analytics confirms course is completed — locking UI");
                        setHasCompleted(true);
                    }
                }
            } catch (e) {
                console.error("Analytics check failed", e);
            }

            // Start the course session (just for tracking startedAt)
            try {
                await api.post(`/student/courses/${courseId}/start`);
            } catch (startError) {
                // Ignore — don't rely on this for the lock
            }

            const [contentRes, questionRes] = await Promise.all([
                api.get(`/student/courses/${courseId}/content`),
                api.get(`/student/courses/${courseId}/questions`),
            ]);

            setContents(contentRes.data);
            setQuestions(questionRes.data);
        } catch (error) {
            console.error('Failed to load course', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionId, letter) => {
        if (hasCompleted) return;
        setAnswers((prev) => ({
            ...prev,
            [questionId]: letter.toUpperCase(),
        }));
    };

    const handleSubmitQuiz = async () => {
        if (hasCompleted) return;

        const unanswered = questions.filter((q) => !answers[getQuestionId(q)]);
        if (unanswered.length > 0) {
            alert(`Please answer all ${questions.length} questions before submitting.`);
            return;
        }

        try {
            setSubmitting(true);

            // Convert string keys to numbers — backend expects Map<Long, String>
            const numericAnswers = {};
            for (const [key, value] of Object.entries(answers)) {
                numericAnswers[Number(key)] = value;
            }

            console.log("Submitting:", { courseId: Number(courseId), answers: numericAnswers });

            const result = await studentApi.submitQuiz(courseId, numericAnswers);
            const msg =
                typeof result === 'string'
                    ? result
                    : result?.message || 'Quiz submitted successfully!';

            setHasCompleted(true);
            alert(msg);
            navigate('/student/dashboard');

        } catch (error) {
            const status = error.response?.status;
            const message = error.response?.data || error.message;

            console.error('Submit error:', status, message);

            if (status === 409) {
                setHasCompleted(true);
                alert("You have already completed this course!");
                navigate('/student/dashboard');
            } else {
                alert(`Submission failed: ${message || getApiErrorMessage(error)}`);
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner message="Preparing your course..." />;

    return (
        <div className="page-container max-w-4xl animate-fade-in">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <button
                    type="button"
                    className="btn-ghost text-sm font-medium"
                    onClick={() => navigate('/student/dashboard')}
                >
                    ← Dashboard
                </button>
                <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate(`/student/course/${courseId}/leaderboard`)}
                >
                    Leaderboard
                </button>
            </div>

            {view === 'content' && (
                <div>
                    <h1 className="page-title border-b border-[var(--border)] pb-4">Course Material</h1>

                    {contents.length === 0 ? (
                        <p className="italic text-[var(--text-muted)]">
                            No reading material provided for this course.
                        </p>
                    ) : (
                        contents.map((content) => (
                            <div key={content.id} className="card card-static mb-6 text-lg leading-relaxed">
                                {content.bodyText}
                            </div>
                        ))
                    )}

                    <div className="mt-12 flex justify-center border-t border-[var(--border)] pt-8">
                        <button
                            type="button"
                            className="btn btn-success px-8 py-3 text-lg"
                            onClick={() => setView('quiz')}
                        >
                            Proceed to Quiz →
                        </button>
                    </div>
                </div>
            )}

            {view === 'quiz' && (
                <div>
                    <div className="mb-6 flex items-center justify-between border-b border-[var(--border)] pb-4">
                        <h1 className="page-title">Knowledge Check</h1>
                        <span className="badge">{questions.length} Questions</span>
                    </div>

                    {/* Completion banner */}
                    {hasCompleted && (
                        <div className="mb-6 p-4 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] text-center font-bold">
                            ✅ You have already completed this course.
                        </div>
                    )}

                    {questions.length === 0 ? (
                        <p className="italic text-[var(--text-muted)]">
                            No quiz questions provided for this course.
                        </p>
                    ) : (
                        questions.map((q, index) => {
                            const qid = getQuestionId(q);
                            const optionsArray = parseQuestionOptions(q.options);
                            return (
                                <div
                                    key={qid}
                                    className="card card-static mb-6 border-l-4 border-[var(--primary)]"
                                >
                                    <h3 className="mb-4 text-xl font-bold text-[var(--text)]">
                                        {index + 1}. {q.questionText}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {optionsArray.map((opt, i) => {
                                            const letter = letterForOptionIndex(i);
                                            const selected = answers[qid] === letter;
                                            return (
                                                <label
                                                    key={`${qid}-${letter}`}
                                                    className={`quiz-option ${selected ? 'quiz-option-selected' : ''} ${hasCompleted ? 'cursor-not-allowed opacity-60' : ''}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${qid}`}
                                                        value={letter}
                                                        checked={selected}
                                                        onChange={() => handleOptionSelect(qid, letter)}
                                                        disabled={hasCompleted}
                                                    />
                                                    <span className="quiz-option-text">
                                                        <strong className="quiz-option-letter">{letter}.</strong>{' '}
                                                        {opt}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    <div className="mt-8 flex items-center justify-between">
                        <button
                            type="button"
                            className="btn-ghost font-bold"
                            onClick={() => setView('content')}
                        >
                            ← Back to Reading
                        </button>

                        <button
                            type="button"
                            className={`btn px-8 text-lg transition-colors ${
                                hasCompleted || submitting || questions.length === 0
                                    ? 'bg-gray-400 text-white cursor-not-allowed opacity-60 pointer-events-none'
                                    : 'btn-primary'
                            }`}
                            onClick={handleSubmitQuiz}
                            disabled={hasCompleted || submitting || questions.length === 0}
                        >
                            {hasCompleted
                                ? '✅ Course Completed'
                                : submitting
                                ? 'Submitting...'
                                : 'Submit Quiz'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}