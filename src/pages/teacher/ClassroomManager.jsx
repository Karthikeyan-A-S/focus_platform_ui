import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import ClassroomStudents from '../../components/teacher/ClassroomStudents';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { parseQuestionOptions, letterForOptionIndex } from '../../utils/quizOptions';

export default function ClassroomManager() {
    const { classroomId } = useParams();
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [classroomTab, setClassroomTab] = useState('courses');

    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showContentModal, setShowContentModal] = useState(false);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [editingContent, setEditingContent] = useState(null); // NEW: State for editing content
    const [editingQuestion, setEditingQuestion] = useState(null);

    const [courseForm, setCourseForm] = useState({ title: '', description: '' });
    const [contentForm, setContentForm] = useState({ bodyText: '' });
    const [questionForm, setQuestionForm] = useState({
        questionText: '', optA: '', optB: '', optC: '', optD: '', correctAnswer: 'A',
    });

    useEffect(() => {
        fetchCourses();
    }, [classroomId]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/teacher/classrooms/${classroomId}/courses`);
            setCourses(response.data);

            if (selectedCourse) {
                const updatedCourse = response.data.find((c) => c.id === selectedCourse.id);
                if (updatedCourse) {
                    const qRes = await api.get(`/teacher/courses/${updatedCourse.id}/questions`);
                    setSelectedCourse({ ...updatedCourse, questions: qRes.data });
                } else {
                    setSelectedCourse(null);
                }
            }
        } catch (error) {
            console.error('Failed to load courses', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCourse = async (course) => {
        try {
            const qRes = await api.get(`/teacher/courses/${course.id}/questions`);
            setSelectedCourse({ ...course, questions: qRes.data });
        } catch (error) {
            console.error("Failed to fetch questions", error);
            setSelectedCourse(course);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/teacher/courses', { classroomId, ...courseForm });
            setShowCourseModal(false);
            setCourseForm({ title: '', description: '' });
            fetchCourses();
        } catch (error) {
            console.error('Error creating course', error);
        }
    };

    const handleCreateContent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/teacher/content', {
                courseId: selectedCourse.id,
                contentType: 'TEXT',
                ...contentForm,
            });
            setShowContentModal(false);
            setContentForm({ bodyText: '' });
            fetchCourses();
        } catch (error) {
            console.error('Error adding content', error);
        }
    };

    // NEW: Update Content function
    const handleUpdateContent = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/teacher/content/${editingContent.id}`, {
                courseId: selectedCourse.id,
                contentType: 'TEXT',
                ...contentForm,
            });
            setEditingContent(null);
            setContentForm({ bodyText: '' });
            fetchCourses();
        } catch (error) {
            console.error('Error updating content', error);
        }
    };

    // NEW: Delete Content function
    const handleDeleteContent = async (id) => {
        if (window.confirm('Delete this lesson content?')) {
            try {
                await api.delete(`/teacher/content/${id}`);
                fetchCourses();
            } catch (error) {
                console.error('Error deleting content', error);
            }
        }
    };

    const handleCreateQuestion = async (e) => {
        e.preventDefault();
        try {
            const optionsString = `${questionForm.optA},${questionForm.optB},${questionForm.optC},${questionForm.optD}`;
            await api.post('/teacher/questions', {
                courseId: selectedCourse.id,
                questionText: questionForm.questionText,
                options: optionsString,
                correctAnswer: questionForm.correctAnswer,
            });
            setShowQuestionModal(false);
            setQuestionForm({
                questionText: '', optA: '', optB: '', optC: '', optD: '', correctAnswer: 'A',
            });
            fetchCourses();
        } catch (error) {
            console.error('Error adding question', error);
        }
    };

    const handleUpdateCourse = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/teacher/courses/${editingCourse.id}`, courseForm);
            setEditingCourse(null);
            setCourseForm({ title: '', description: '' });
            fetchCourses();
        } catch (error) {
            console.error('Error updating course', error);
        }
    };

    const handleUpdateQuestion = async (e) => {
        e.preventDefault();
        try {
            const optionsString = `${questionForm.optA},${questionForm.optB},${questionForm.optC},${questionForm.optD}`;
            await api.put(`/teacher/questions/${editingQuestion.id}`, {
                courseId: selectedCourse.id,
                questionText: questionForm.questionText,
                options: optionsString,
                correctAnswer: questionForm.correctAnswer,
            });
            setEditingQuestion(null);
            setQuestionForm({
                questionText: '', optA: '', optB: '', optC: '', optD: '', correctAnswer: 'A',
            });
            fetchCourses();
        } catch (error) {
            console.error('Error updating question', error);
        }
    };

    const handleDeleteCourse = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Delete this entire course and all its content?')) {
            try {
                await api.delete(`/teacher/courses/${id}`);
                fetchCourses();
            } catch (error) {
                console.error('Error deleting course', error);
            }
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (window.confirm('Delete this question?')) {
            try {
                await api.delete(`/teacher/questions/${id}`);
                fetchCourses();
            } catch (error) {
                console.error('Error deleting question', error);
            }
        }
    };

    const openQuestionEdit = (q) => {
        const opts = parseQuestionOptions(q.options);
        let correctLetter = String(q.correctAnswer || '').trim().toUpperCase();
        if (!['A', 'B', 'C', 'D'].includes(correctLetter)) {
            const idx = opts.findIndex(
                (o) => o === q.correctAnswer || o.trim() === String(q.correctAnswer || '').trim()
            );
            correctLetter = idx >= 0 ? letterForOptionIndex(idx) : 'A';
        }
        setQuestionForm({
            questionText: q.questionText,
            optA: opts[0] || '',
            optB: opts[1] || '',
            optC: opts[2] || '',
            optD: opts[3] || '',
            correctAnswer: correctLetter,
        });
        setEditingQuestion(q);
    };

    if (loading) return <LoadingSpinner message="Loading classroom..." />;

    if (selectedCourse) {
        return (
            <div className="page-container animate-fade-in">
                <button
                    type="button"
                    className="btn btn-secondary mb-4"
                    onClick={() => setSelectedCourse(null)}
                >
                    ← Back to All Courses
                </button>

                <div className="card mb-6 border-l-4 border-[var(--primary)]">
                    <div className="page-header mb-0">
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text)]">{selectedCourse.title}</h1>
                            <p className="mt-2 text-[var(--text-muted)]">{selectedCourse.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                to={`/teacher/courses/${selectedCourse.id}/analytics`}
                                className="btn btn-outline btn-sm"
                            >
                                Analytics
                            </Link>
                            <Link
                                to={`/teacher/courses/${selectedCourse.id}/leaderboard`}
                                className="btn btn-outline btn-sm"
                            >
                                Leaderboard
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-2">
                        <h2 className="text-xl font-bold">Course Content</h2>
                        <button type="button" className="btn btn-sm" onClick={() => setShowContentModal(true)}>
                            + Add Content
                        </button>
                    </div>
                    {/* NEW: Updated Content render to show Edit and Delete buttons */}
                    {selectedCourse.contents?.map((content, index) => (
                        <div key={content.id} className="card relative mb-3 bg-[var(--surface)] border-l-4 border-[var(--primary)]">
                            <div className="flex justify-between gap-4">
                                <div className="mb-2 text-md leading-relaxed whitespace-pre-wrap flex-1">
                                    <span className="font-bold mr-2 text-[var(--primary)]">Part {index + 1}:</span>
                                    {content.bodyText}
                                </div>
                                <div className="flex shrink-0 gap-3">
                                    <button
                                        type="button"
                                        className="text-sm font-bold text-[var(--primary)]"
                                        onClick={() => {
                                            setContentForm({ bodyText: content.bodyText });
                                            setEditingContent(content);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="text-sm font-bold text-[var(--danger)]"
                                        onClick={() => handleDeleteContent(content.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-2">
                        <h2 className="text-xl font-bold">Quiz Questions</h2>
                        <button
                            type="button"
                            className="btn btn-sm"
                            style={{ background: 'var(--success)' }}
                            onClick={() => setShowQuestionModal(true)}
                        >
                            + Add Question
                        </button>
                    </div>
                    {selectedCourse.questions?.map((q, index) => (
                        <div
                            key={q.id}
                            className="card relative mb-3 border-l-4 border-[var(--success)]"
                        >
                            <div className="flex justify-between gap-4">
                                <p className="mb-2 text-lg font-bold">
                                    Q{index + 1}: {q.questionText}
                                </p>
                                <div className="flex shrink-0 gap-3">
                                    <button
                                        type="button"
                                        className="text-sm font-bold text-[var(--primary)]"
                                        onClick={() => openQuestionEdit(q)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="text-sm font-bold text-[var(--danger)]"
                                        onClick={() => handleDeleteQuestion(q.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div className="mb-2 grid grid-cols-2 gap-2 text-sm">
                                {parseQuestionOptions(q.options).map((opt, i) => (
                                    <div
                                        key={i}
                                        className="rounded bg-[var(--surface)] p-2 text-[var(--text-muted)]"
                                    >
                                        <strong>{letterForOptionIndex(i)}.</strong> {opt}
                                    </div>
                                ))}
                            </div>
                            <p className="inline-block rounded bg-[var(--primary-muted)] px-2 py-1 text-sm font-bold text-[var(--success)]">
                                Answer: {q.correctAnswer}
                            </p>
                        </div>
                    ))}
                </div>

                {(showQuestionModal || editingQuestion) && (
                    <div className="modal-overlay">
                        <div className="modal-content max-w-lg">
                            <h2 className="mb-4 text-xl font-bold">
                                {editingQuestion ? 'Edit Question' : 'Add New Question'}
                            </h2>
                            <form onSubmit={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}>
                                <label className="mb-1 block text-sm font-bold">Question Text</label>
                                <input
                                    className="input-field mb-4"
                                    value={questionForm.questionText}
                                    onChange={(e) =>
                                        setQuestionForm({ ...questionForm, questionText: e.target.value })
                                    }
                                    required
                                />
                                <div className="mb-4 grid grid-cols-2 gap-2">
                                    {['optA', 'optB', 'optC', 'optD'].map((key, i) => (
                                        <div key={key}>
                                            <label className="text-xs font-bold">
                                                Option {String.fromCharCode(65 + i)}
                                            </label>
                                            <input
                                                className="input-field"
                                                value={questionForm[key]}
                                                onChange={(e) =>
                                                    setQuestionForm({ ...questionForm, [key]: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                                <label className="mb-1 block text-sm font-bold text-[var(--success)]">
                                    Correct Answer (letter)
                                </label>
                                <select
                                    className="input-field mb-6"
                                    value={questionForm.correctAnswer}
                                    onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                                    required
                                >
                                    {['optA', 'optB', 'optC', 'optD']
                                        .map((key, i) => ({
                                            letter: letterForOptionIndex(i),
                                            text: questionForm[key],
                                        }))
                                        .filter((o) => o.text?.trim())
                                        .map((o) => (
                                            <option key={o.letter} value={o.letter}>
                                                {o.letter} — {o.text}
                                            </option>
                                        ))}
                                </select>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowQuestionModal(false);
                                            setEditingQuestion(null);
                                            setQuestionForm({
                                                questionText: '',
                                                optA: '',
                                                optB: '',
                                                optC: '',
                                                optD: '',
                                                correctAnswer: 'A',
                                            });
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn">Save Question</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* NEW: Updated Content Modal to handle edits */}
                {(showContentModal || editingContent) && (
                    <div className="modal-overlay">
                        <div className="modal-content max-w-lg">
                            <h2 className="mb-4 text-xl font-bold">
                                {editingContent ? 'Edit Course Content' : 'Add Course Content'}
                            </h2>
                            <form onSubmit={editingContent ? handleUpdateContent : handleCreateContent}>
                                <textarea
                                    className="input-field mb-4 h-40"
                                    placeholder="Enter lesson text..."
                                    value={contentForm.bodyText}
                                    onChange={(e) => setContentForm({ ...contentForm, bodyText: e.target.value })}
                                    required
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowContentModal(false);
                                            setEditingContent(null);
                                            setContentForm({ bodyText: '' });
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn">
                                        {editingContent ? 'Save Changes' : 'Save Content'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="page-container animate-fade-in">
            <button
                type="button"
                className="mb-4 text-sm font-medium text-[var(--primary)] hover:underline"
                onClick={() => navigate('/teacher/dashboard')}
            >
                ← Teacher Dashboard
            </button>

            <div className="page-header">
                <h1 className="page-title">Classroom</h1>
                {classroomTab === 'courses' && (
                    <button type="button" className="btn" onClick={() => setShowCourseModal(true)}>
                        + Create Course
                    </button>
                )}
            </div>

            <div className="tab-bar">
                <button
                    type="button"
                    className={`tab-btn ${classroomTab === 'courses' ? 'active' : ''}`}
                    onClick={() => setClassroomTab('courses')}
                >
                    Courses
                </button>
                <button
                    type="button"
                    className={`tab-btn ${classroomTab === 'students' ? 'active' : ''}`}
                    onClick={() => setClassroomTab('students')}
                >
                    Students
                </button>
            </div>

            {classroomTab === 'students' ? (
                <ClassroomStudents classroomId={classroomId} />
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="card flex cursor-pointer flex-col justify-between"
                            onClick={() => handleSelectCourse(course)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSelectCourse(course)}
                            role="button"
                            tabIndex={0}
                        >
                            <div>
                                <h2 className="mb-2 text-xl font-bold text-[var(--primary)]">{course.title}</h2>
                                <p className="line-clamp-3 text-sm text-[var(--text-muted)]">{course.description}</p>
                            </div>

                            <div className="course-actions" onClick={(e) => e.stopPropagation()}>
                                <button
                                    type="button"
                                    className="btn btn-sm flex-1"
                                    onClick={() => handleSelectCourse(course)}
                                >
                                    Manage
                                </button>
                                <Link
                                    to={`/teacher/courses/${course.id}/analytics`}
                                    className="btn btn-outline btn-sm"
                                >
                                    Stats
                                </Link>
                                <Link
                                    to={`/teacher/courses/${course.id}/leaderboard`}
                                    className="btn btn-outline btn-sm"
                                >
                                    Board
                                </Link>
                            </div>

                            <div
                                className="mt-2 flex justify-between border-t border-[var(--border)] pt-3"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    className="text-sm font-bold text-[var(--primary)]"
                                    onClick={() => {
                                        setEditingCourse(course);
                                        setCourseForm({
                                            title: course.title,
                                            description: course.description,
                                        });
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    className="text-sm font-bold text-[var(--danger)]"
                                    onClick={(e) => handleDeleteCourse(course.id, e)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(showCourseModal || editingCourse) && (
                <div className="modal-overlay">
                    <div className="modal-content max-w-md">
                        <h2 className="mb-4 text-xl font-bold">
                            {editingCourse ? 'Edit Course' : 'Create a New Course'}
                        </h2>
                        <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}>
                            <label className="mb-1 block text-sm font-bold">Course Title</label>
                            <input
                                className="input-field mb-4"
                                value={courseForm.title}
                                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                required
                            />
                            <label className="mb-1 block text-sm font-bold">Description</label>
                            <textarea
                                className="input-field mb-6 h-24"
                                value={courseForm.description}
                                onChange={(e) =>
                                    setCourseForm({ ...courseForm, description: e.target.value })
                                }
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowCourseModal(false);
                                        setEditingCourse(null);
                                        setCourseForm({ title: '', description: '' });
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn">
                                    {editingCourse ? 'Save Changes' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}   