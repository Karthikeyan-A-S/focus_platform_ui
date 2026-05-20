import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentApi } from '../../api/studentApi';

export default function CoursePlayer() {
    const { courseId } = useParams(); // Grabs the ID from the URL (e.g., /student/course/1)
    const navigate = useNavigate();

    // App State
    const [step, setStep] = useState(1); // 1 = Content, 2 = Quiz, 3 = Results
    const [content, setContent] = useState([]);
    const [questions, setQuestions] = useState([]);
    
    // Quiz State (Maps question ID to selected answer string)
    const [answers, setAnswers] = useState({});
    const [resultMessage, setResultMessage] = useState('');
    
    // UI State
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Fetch data when component loads
    useEffect(() => {
        const loadCourseData = async () => {
            try {
                // Fetch both concurrently to save time
                const [contentData, questionsData] = await Promise.all([
                    studentApi.getCourseContent(courseId),
                    studentApi.getCourseQuestions(courseId)
                ]);
                setContent(contentData);
                setQuestions(questionsData);
            } catch (err) {
                setError("Failed to load course materials.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadCourseData();
    }, [courseId]);

    // Handle selecting a radio button
    const handleOptionChange = (questionId, selectedOption) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    // Handle final submission to backend
    const handleSubmitQuiz = async () => {
        setSubmitting(true);
        try {
            const responseString = await studentApi.submitQuiz(courseId, answers);
            setResultMessage(responseString);
            setStep(3); // Move to results view
        } catch (err) {
            setError("Failed to submit quiz.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container" style={{ marginTop: '50px' }}>Loading course...</div>;
    if (error) return <div className="container" style={{ marginTop: '50px', color: 'var(--error-color)' }}>{error}</div>;

    return (
        <div className="container" style={{ marginTop: '30px', maxWidth: '800px' }}>
            
            {/* STEP 1: READING MATERIAL */}
            {step === 1 && (
                <div className="card">
                    <h2 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        Course Material
                    </h2>
                    
                    {content.length === 0 ? (
                        <p>No content available for this course yet.</p>
                    ) : (
                        content.map((item) => (
                            <div key={item.id} style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                                {item.contentType === 'TEXT' && <p>{item.bodyText}</p>}
                                {/* Add handling for VIDEO/PDF here later if needed */}
                            </div>
                        ))
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
                        <button className="btn btn-primary" onClick={() => setStep(2)}>
                            Next: Take Quiz
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: THE QUIZ */}
            {step === 2 && (
                <div className="card">
                    <h2 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        Knowledge Check
                    </h2>
                    
                    {questions.length === 0 ? (
                        <p>No questions available for this course.</p>
                    ) : (
                        questions.map((q, index) => {
                            // Backend sends options as a JSON string array, so we parse it
                            const optionsArray = JSON.parse(q.options);
                            
                            return (
                                <div key={q.id} style={{ marginBottom: '30px' }}>
                                    <h4 style={{ marginBottom: '10px' }}>{index + 1}. {q.questionText}</h4>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '10px' }}>
                                        {optionsArray.map((opt, i) => (
                                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                                <input 
                                                    type="radio" 
                                                    name={`question-${q.id}`} 
                                                    value={opt}
                                                    checked={answers[q.id] === opt}
                                                    onChange={() => handleOptionChange(q.id, opt)}
                                                />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                        <button className="btn" onClick={() => setStep(1)} style={{ background: '#ddd' }}>
                            Back to Reading
                        </button>
                        <button 
                            className="btn btn-primary" 
                            onClick={handleSubmitQuiz} 
                            disabled={submitting || questions.length === 0}
                        >
                            {submitting ? 'Grading...' : 'Submit Answers'}
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: RESULTS */}
            {step === 3 && (
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <h1 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>Quiz Complete!</h1>
                    <h3 style={{ marginBottom: '30px' }}>{resultMessage}</h3>
                    
                    <button className="btn btn-primary" onClick={() => navigate('/student/dashboard')}>
                        Return to Dashboard
                    </button>
                </div>
            )}

        </div>
    );
}