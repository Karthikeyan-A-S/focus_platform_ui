import api from './axiosConfig';

export const studentApi = {
    enroll: async (inviteCode) => {
        const response = await api.post('/student/enroll', { inviteCode });
        return response.data;
    },

    getCourseContent: async (courseId) => {
        const response = await api.get(`/student/courses/${courseId}/content`);
        return response.data;
    },

    getCourseQuestions: async (courseId) => {
        const response = await api.get(`/student/courses/${courseId}/questions`);
        return response.data;
    },

    submitQuiz: async (courseId, answers) => {
        const body = {
            courseId: Number(courseId),
            answers: answers, 
        };

        try {
            const response = await api.post('/student/quiz/submit', body);
            return response.data;
        } catch (err) {
            if (err.response?.status === 404) {
                const fallback = await api.post('/student/submit', body);
                return fallback.data;
            }
            throw err;
        }
    },

    getEnrolledClassrooms: async () => {
        const response = await api.get('/student/classrooms');
        return response.data;
    },
};