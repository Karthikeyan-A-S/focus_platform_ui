import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function CoursePlayer() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    // The state machine: 'content' -> 'quiz'
    // (Removed 'result' view, as we will use alerts and navigate away instantly)
    const [view, setView] = useState('content');
    
    // Data States
    const [contents, setContents] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Quiz States
    const [answers, setAnswers] = useState({}); 

    useEffect(() => {
        loadCourseData();
    }, [courseId]);

    const loadCourseData = async () => {
        try {
            await api.post(`/student/courses/${courseId}/start`);

            const [contentRes, questionRes] = await Promise.all([
                api.get(`/student/courses/${courseId}/content`),
                api.get(`/student/courses/${courseId}/questions`)
            ]);

            setContents(contentRes.data);
            setQuestions(questionRes.data);
        } catch (error) {
            console.error("Failed to load course", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionId, optionValue) => {
        setAnswers({
            ...answers,
            [questionId]: optionValue
        });
    };

    const handleSubmitQuiz = async () => {
        if (Object.keys(answers).length < questions.length) {
            alert("Please answer all questions before submitting!");
            return;
        }

        try {
            const response = await api.post('/student/submit', {
                courseId: parseInt(courseId),
                answers: answers
            });
            
            // 1. Ensure the response is safely treated as text
            const msg = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
            
            // 2. Alert the success message
            alert(msg);
            
            // 3. Immediately kick the user back to the dashboard so they can't re-edit
            navigate('/student/dashboard'); 
            
        } catch (error) {
            console.error("Error submitting quiz", error);
            
            // Safely extract the Spring Boot JSON error to prevent the React crash!
            let errorMsg = "An internal server error occurred.";
            if (error.response && error.response.data) {
                errorMsg = typeof error.response.data === 'string' 
                    ? error.response.data 
                    : error.response.data.message || "Backend Error 500: Check Spring Boot Console";
            }
            
            alert(`Submission Alert: ${errorMsg}`);
            navigate('/student/dashboard'); // Kick them out if it fails or if they already completed it
        }
    };

    if (loading) return <div className="p-6 text-center text-xl mt-10">Preparing your course environment...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            
            {/* VIEW 1: READING CONTENT */}
            {view === 'content' && (
                <div className="animate-fade-in">
                    <button className="text-blue-500 font-bold mb-6 hover:underline" onClick={() => navigate('/student/dashboard')}>
                        ← Back to Dashboard
                    </button>
                    
                    <h1 className="text-3xl font-bold border-b pb-4 mb-6 text-gray-800">Course Material</h1>
                    
                    {contents.length === 0 ? (
                        <p className="text-gray-500 italic">No reading material provided for this course.</p>
                    ) : (
                        contents.map(content => (
                            <div key={content.id} className="prose max-w-none text-gray-700 text-lg leading-relaxed mb-8 bg-white p-6 rounded-lg shadow-sm">
                                {content.bodyText}
                            </div>
                        ))
                    )}

                    <div className="mt-12 flex justify-center border-t pt-8">
                        <button 
                            className="btn bg-green-600 text-lg px-8 py-3 shadow-lg hover:bg-green-700 transition-all"
                            onClick={() => setView('quiz')}
                        >
                            I have finished reading → Proceed to Quiz
                        </button>
                    </div>
                </div>
            )}

            {/* VIEW 2: TAKING THE QUIZ */}
            {view === 'quiz' && (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center border-b pb-4 mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">Knowledge Check</h1>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-sm">
                            {questions.length} Questions
                        </span>
                    </div>

                    {questions.length === 0 ? (
                        <p className="text-gray-500 italic">No quiz questions provided for this course.</p>
                    ) : (
                        questions.map((q, index) => {
                            const optionsArray = q.options.split(','); 
                            return (
                                <div key={q.id} className="card mb-6 border-l-4 border-blue-500 bg-white">
                                    <h3 className="text-xl font-bold mb-4">{index + 1}. {q.questionText}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {optionsArray.map((opt, i) => (
                                            <label 
                                                key={i} 
                                                className={`p-3 border rounded cursor-pointer transition-colors flex items-center gap-3
                                                    ${answers[q.id] === opt.trim() ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-gray-50'}
                                                `}
                                            >
                                                <input 
                                                    type="radio" 
                                                    name={`question-${q.id}`} 
                                                    value={opt.trim()}
                                                    checked={answers[q.id] === opt.trim()}
                                                    onChange={(e) => handleOptionSelect(q.id, e.target.value)}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <span className="text-gray-700">{opt.trim()}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    <div className="mt-8 flex justify-between items-center">
                        <button className="text-gray-500 hover:text-gray-800 font-bold" onClick={() => setView('content')}>
                            ← Back to Reading
                        </button>
                        <button 
                            className="btn bg-blue-600 text-lg px-8 shadow-lg hover:bg-blue-700"
                            onClick={handleSubmitQuiz}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}