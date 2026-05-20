import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { getApiErrorMessage } from '../../utils/apiError';
import {
    parseQuestionOptions,
    letterForOptionIndex,
    buildSubmitAnswersPayload,
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

    /** questionId -> 'A' | 'B' | 'C' | 'D' */
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        setAnswers({});
        setView('content');
        loadCourseData();
    }, [courseId]);

    const loadCourseData = async () => {
        try {
            setLoading(true);
            await api.post(`/student/courses/${courseId}/start`);

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
        setAnswers((prev) => ({
            ...prev,
            [questionId]: letter,
        }));
    };

    const handleSubmitQuiz = async () => {
        const unanswered = questions.filter((q) => !answers[q.id]);
        if (unanswered.length > 0) {
            alert(`Please answer all ${questions.length} questions before submitting.`);
            return;
        }

        const payload = buildSubmitAnswersPayload(questions, answers);

        try {
            setSubmitting(true);
            const response = await api.post('/student/submit', {
                courseId: parseInt(courseId, 10),
                answers: payload,
            });

            const msg =
                typeof response.data === 'string'
                    ? response.data
                    : response.data?.message || 'Quiz submitted successfully!';
            alert(msg);
            navigate('/student/dashboard');
        } catch (error) {
            console.error('Error submitting quiz', error);
            alert(`Submission failed: ${getApiErrorMessage(error)}`);
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
                    className="text-sm font-medium text-[var(--primary)] hover:underline"
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
                            <div key={content.id} className="card mb-6 text-lg leading-relaxed">
                                {content.bodyText}
                            </div>
                        ))
                    )}

                    <div className="mt-12 flex justify-center border-t border-[var(--border)] pt-8">
                        <button
                            type="button"
                            className="btn px-8 py-3 text-lg"
                            style={{ background: 'var(--success)' }}
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
                        <span className="rounded-full bg-[var(--primary-muted)] px-3 py-1 text-sm font-bold text-[var(--primary)]">
                            {questions.length} Questions
                        </span>
                    </div>

                    {questions.length === 0 ? (
                        <p className="italic text-[var(--text-muted)]">
                            No quiz questions provided for this course.
                        </p>
                    ) : (
                        questions.map((q, index) => {
                            const optionsArray = parseQuestionOptions(q.options);
                            return (
                                <div
                                    key={q.id}
                                    className="card mb-6 border-l-4 border-[var(--primary)]"
                                >
                                    <h3 className="mb-4 text-xl font-bold">
                                        {index + 1}. {q.questionText}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {optionsArray.map((opt, i) => {
                                            const letter = letterForOptionIndex(i);
                                            const selected = answers[q.id] === letter;
                                            return (
                                                <label
                                                    key={letter}
                                                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                                                        selected
                                                            ? 'border-[var(--primary)] bg-[var(--primary-muted)] ring-1 ring-[var(--primary)]'
                                                            : 'border-[var(--border)] hover:bg-[var(--surface)]'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${q.id}`}
                                                        value={letter}
                                                        checked={selected}
                                                        onChange={() =>
                                                            handleOptionSelect(q.id, letter)
                                                        }
                                                    />
                                                    <span>
                                                        <strong className="text-[var(--primary)]">
                                                            {letter}.
                                                        </strong>{' '}
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
                            className="font-bold text-[var(--text-muted)] hover:text-[var(--text)]"
                            onClick={() => setView('content')}
                        >
                            ← Back to Reading
                        </button>
                        <button
                            type="button"
                            className="btn px-8 text-lg"
                            onClick={handleSubmitQuiz}
                            disabled={submitting || questions.length === 0}
                        >
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
