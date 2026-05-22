import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import ChatWindow from '../components/chat/ChatWindow';

export default function ChatPage() {
    const { targetType, targetId } = useParams();
    const navigate = useNavigate();
    
    // NEW: State to hold the list of students/teachers
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (targetType === 'CLASSROOM') {
            fetchParticipants();
        } else {
            // General global chat doesn't need a specific participant list
            setLoading(false);
        }
    }, [targetType, targetId]);

    const fetchParticipants = async () => {
        try {
            // Ask the backend for everyone enrolled in this specific classroom
            const response = await api.get(`/classrooms/${targetId}/participants`);
            setParticipants(response.data);
        } catch (error) {
            console.error("Failed to load classroom participants", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading chat...</div>;

    return (
        <div className="page-container flex flex-col animate-fade-in" style={{ height: 'calc(100vh - 80px)' }}>
            <button 
                onClick={() => navigate(-1)} 
                className="mb-4 self-start text-sm font-medium text-[var(--primary)] hover:underline"
            >
                ← Back to Dashboard
            </button>
            
            <div className="flex-1 overflow-hidden">
                <ChatWindow 
                    targetType={targetType.toUpperCase()} 
                    targetId={Number(targetId)} 
                    participants={participants} // <-- WE PASS THE DATA HERE!
                />
            </div>
        </div>
    );
}