import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { studentApi } from '../../api/studentApi';
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
            [questionId]: letter.toUpperCase(),
        }));
    };

    const handleSubmitQuiz = async () => {
        const unanswered = questions.filter((q) => !answers[getQuestionId(q)]);
        if (unanswered.length > 0) {
            alert(`Please answer all ${questions.length} questions before submitting.`);
            return;
        }

        try {
            setSubmitting(true);
            console.log("SENDING ANSWERS TO API:", answers);
            // Send the raw dictionary of answers directly to the API
            const result = await studentApi.submitQuiz(courseId, answers);
            const msg =
                typeof result === 'string'
                    ? result
                    : result?.message || 'Quiz submitted successfully!';
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
                        <span className="badge">
                            {questions.length} Questions
                        </span>
                    </div>

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
                                                    className={`quiz-option ${selected ? 'quiz-option-selected' : ''}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${qid}`}
                                                        value={letter}
                                                        checked={selected}
                                                        onChange={() => handleOptionSelect(qid, letter)}
                                                    />
                                                    <span className="quiz-option-text">
                                                        <strong className="quiz-option-letter">
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
                            className="btn-ghost font-bold"
                            onClick={() => setView('content')}
                        >
                            ← Back to Reading
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary px-8 text-lg"
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