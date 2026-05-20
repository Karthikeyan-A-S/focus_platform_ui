import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function ClassroomManager() {
    const { classroomId } = useParams();
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal Visibilities
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showContentModal, setShowContentModal] = useState(false);
    const [showQuestionModal, setShowQuestionModal] = useState(false);

    // Edit Modal Visibilities
    const [editingCourse, setEditingCourse] = useState(null);
    const [editingQuestion, setEditingQuestion] = useState(null);

    // Form States
    const [courseForm, setCourseForm] = useState({ title: '', description: '' });
    const [contentForm, setContentForm] = useState({ bodyText: '' });
    const [questionForm, setQuestionForm] = useState({ 
        questionText: '', optA: '', optB: '', optC: '', optD: '', correctAnswer: '' 
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
                const updatedCourse = response.data.find(c => c.id === selectedCourse.id);
                setSelectedCourse(updatedCourse || null); // Go back if deleted
            }
        } catch (error) {
            console.error("Failed to load courses", error);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // CREATE HANDLERS
    // ==========================================
    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/teacher/courses', { classroomId, ...courseForm });
            setShowCourseModal(false);
            setCourseForm({ title: '', description: '' });
            fetchCourses();
        } catch (error) { console.error("Error creating course", error); }
    };

    const handleCreateContent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/teacher/content', { courseId: selectedCourse.id, contentType: 'TEXT', ...contentForm });
            setShowContentModal(false);
            setContentForm({ bodyText: '' });
            fetchCourses();
        } catch (error) { console.error("Error adding content", error); }
    };

    const handleCreateQuestion = async (e) => {
        e.preventDefault();
        try {
            const optionsString = `${questionForm.optA},${questionForm.optB},${questionForm.optC},${questionForm.optD}`;
            await api.post('/teacher/questions', { 
                courseId: selectedCourse.id, 
                questionText: questionForm.questionText, 
                options: optionsString, 
                correctAnswer: questionForm.correctAnswer 
            });
            setShowQuestionModal(false);
            setQuestionForm({ questionText: '', optA: '', optB: '', optC: '', optD: '', correctAnswer: '' });
            fetchCourses();
        } catch (error) { console.error("Error adding question", error); }
    };

    // ==========================================
    // UPDATE HANDLERS
    // ==========================================
    const handleUpdateCourse = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/teacher/courses/${editingCourse.id}`, courseForm);
            setEditingCourse(null);
            setCourseForm({ title: '', description: '' });
            fetchCourses();
        } catch (error) { console.error("Error updating course", error); }
    };

    const handleUpdateQuestion = async (e) => {
        e.preventDefault();
        try {
            const optionsString = `${questionForm.optA},${questionForm.optB},${questionForm.optC},${questionForm.optD}`;
            await api.put(`/teacher/questions/${editingQuestion.id}`, {
                courseId: selectedCourse.id,
                questionText: questionForm.questionText,
                options: optionsString,
                correctAnswer: questionForm.correctAnswer
            });
            setEditingQuestion(null);
            setQuestionForm({ questionText: '', optA: '', optB: '', optC: '', optD: '', correctAnswer: '' });
            fetchCourses();
        } catch (error) { console.error("Error updating question", error); }
    };

    // ==========================================
    // DELETE HANDLERS
    // ==========================================
    const handleDeleteCourse = async (id, e) => {
        e.stopPropagation(); // Prevents the card click from opening the course
        if (window.confirm("Delete this entire course and all its content?")) {
            try {
                await api.delete(`/teacher/courses/${id}`);
                fetchCourses();
            } catch (error) { console.error("Error deleting course", error); }
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (window.confirm("Delete this question?")) {
            try {
                await api.delete(`/teacher/questions/${id}`);
                fetchCourses();
            } catch (error) { console.error("Error deleting question", error); }
        }
    };

    // Helper to open Question Edit Modal and populate data
    const openQuestionEdit = (q) => {
        const opts = q.options.split(',');
        setQuestionForm({
            questionText: q.questionText,
            optA: opts[0] || '', optB: opts[1] || '', optC: opts[2] || '', optD: opts[3] || '',
            correctAnswer: q.correctAnswer
        });
        setEditingQuestion(q);
    };

    if (loading) return <div className="p-6">Loading classroom data...</div>;

    // ==========================================
    // VIEW 1: INSIDE A SPECIFIC COURSE
    // ==========================================
    if (selectedCourse) {
        return (
            <div className="p-6">
                <button className="btn bg-gray-500 mb-4" onClick={() => setSelectedCourse(null)}>← Back to All Courses</button>
                
                <div className="card mb-6 border-l-4 border-blue-500">
                    <h1 className="text-3xl font-bold">{selectedCourse.title}</h1>
                    <p className="text-gray-600 mt-2">{selectedCourse.description}</p>
                </div>

                {/* CONTENT SECTION */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-2xl font-bold">Course Content</h2>
                        <button className="btn" onClick={() => setShowContentModal(true)}>+ Add Content</button>
                    </div>
                    {selectedCourse.contents?.map(content => (
                        <div key={content.id} className="card mb-2 bg-gray-50">
                            <p>{content.bodyText}</p>
                        </div>
                    ))}
                </div>

                {/* QUESTIONS SECTION */}
                <div>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-2xl font-bold">Quiz Questions</h2>
                        <button className="btn bg-green-600" onClick={() => setShowQuestionModal(true)}>+ Add Question</button>
                    </div>
                    {selectedCourse.questions?.map((q, index) => (
                        <div key={q.id} className="card mb-3 border-l-4 border-green-500 relative">
                            <div className="flex justify-between">
                                <p className="font-bold text-lg mb-2">Q{index + 1}: {q.questionText}</p>
                                {/* Edit/Delete Question Buttons */}
                                <div className="flex gap-3">
                                    <button className="text-blue-500 hover:text-blue-700 font-bold text-sm" onClick={() => openQuestionEdit(q)}>Edit</button>
                                    <button className="text-red-500 hover:text-red-700 font-bold text-sm" onClick={() => handleDeleteQuestion(q.id)}>Delete</button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-2">
                                {q.options.split(',').map((opt, i) => (
                                    <div key={i} className="bg-gray-100 p-2 rounded">• {opt}</div>
                                ))}
                            </div>
                            <p className="text-sm bg-green-100 text-green-800 inline-block px-2 py-1 rounded font-bold">Answer: {q.correctAnswer}</p>
                        </div>
                    ))}
                </div>

                {/* MODAL: ADD/EDIT QUESTION */}
                {(showQuestionModal || editingQuestion) && (
                    <div className="modal-overlay">
                        <div className="card modal-content w-full max-w-lg">
                            <h2 className="text-2xl mb-4 font-bold">{editingQuestion ? "Edit Question" : "Add New Question"}</h2>
                            <form onSubmit={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}>
                                <label className="block text-sm font-bold mb-1">Question Text</label>
                                <input className="input-field mb-4 w-full" value={questionForm.questionText} onChange={e => setQuestionForm({...questionForm, questionText: e.target.value})} required />
                                
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div><label className="text-xs font-bold">Option A</label><input className="input-field w-full" value={questionForm.optA} onChange={e => setQuestionForm({...questionForm, optA: e.target.value})} required /></div>
                                    <div><label className="text-xs font-bold">Option B</label><input className="input-field w-full" value={questionForm.optB} onChange={e => setQuestionForm({...questionForm, optB: e.target.value})} required /></div>
                                    <div><label className="text-xs font-bold">Option C</label><input className="input-field w-full" value={questionForm.optC} onChange={e => setQuestionForm({...questionForm, optC: e.target.value})} required /></div>
                                    <div><label className="text-xs font-bold">Option D</label><input className="input-field w-full" value={questionForm.optD} onChange={e => setQuestionForm({...questionForm, optD: e.target.value})} required /></div>
                                </div>

                                <label className="block text-sm font-bold mb-1 text-green-600">Correct Answer (Must match an option exactly)</label>
                                <input className="input-field mb-6 w-full border-green-400" value={questionForm.correctAnswer} onChange={e => setQuestionForm({...questionForm, correctAnswer: e.target.value})} required />
                                
                                <div className="flex justify-end gap-2">
                                    <button type="button" className="btn bg-gray-400" onClick={() => { setShowQuestionModal(false); setEditingQuestion(null); setQuestionForm({ questionText: '', optA: '', optB: '', optC: '', optD: '', correctAnswer: '' }); }}>Cancel</button>
                                    <button type="submit" className="btn bg-blue-600">Save Question</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                
                {/* MODAL: ADD CONTENT */}
                {showContentModal && (
                    <div className="modal-overlay">
                        <div className="card modal-content w-full max-w-lg">
                            <h2 className="text-2xl mb-4 font-bold">Add Course Content</h2>
                            <form onSubmit={handleCreateContent}>
                                <textarea className="input-field mb-4 w-full h-40" placeholder="Enter lesson text..." value={contentForm.bodyText} onChange={e => setContentForm({...contentForm, bodyText: e.target.value})} required />
                                <div className="flex justify-end gap-2">
                                    <button type="button" className="btn bg-gray-400" onClick={() => setShowContentModal(false)}>Cancel</button>
                                    <button type="submit" className="btn bg-blue-600">Save Content</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ==========================================
    // VIEW 2: ALL COURSES (DEFAULT)
    // ==========================================
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Classroom Courses</h1>
                <button className="btn" onClick={() => setShowCourseModal(true)}>+ Create New Course</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="card flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedCourse(course)}>
                        <div>
                            <h2 className="text-xl font-bold mb-2 text-blue-900">{course.title}</h2>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-4">{course.description}</p>
                        </div>
                        
                        {/* Edit/Delete Course Buttons */}
                        <div className="flex justify-between border-t pt-3 mt-2">
                            <button 
                                className="text-sm text-blue-500 hover:text-blue-700 font-bold"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingCourse(course);
                                    setCourseForm({ title: course.title, description: course.description });
                                }}
                            >
                                Edit Course
                            </button>
                            <button 
                                className="text-sm text-red-500 hover:text-red-700 font-bold"
                                onClick={(e) => handleDeleteCourse(course.id, e)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL: ADD/EDIT COURSE */}
            {(showCourseModal || editingCourse) && (
                <div className="modal-overlay">
                    <div className="card modal-content w-full max-w-md">
                        <h2 className="text-2xl mb-4 font-bold">{editingCourse ? "Edit Course" : "Create a New Course"}</h2>
                        <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}>
                            <label className="block text-sm font-bold mb-1">Course Title</label>
                            <input className="input-field mb-4 w-full" value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} required />
                            
                            <label className="block text-sm font-bold mb-1">Description</label>
                            <textarea className="input-field mb-6 w-full h-24" value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} required />
                            
                            <div className="flex justify-end gap-2">
                                <button type="button" className="btn bg-gray-400" onClick={() => { setShowCourseModal(false); setEditingCourse(null); setCourseForm({ title: '', description: '' }); }}>Cancel</button>
                                <button type="submit" className="btn bg-blue-600">{editingCourse ? "Save Changes" : "Create Course"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}