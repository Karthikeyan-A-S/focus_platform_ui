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
        // FIX: Always convert keys to numbers here — JS object keys are always
        // strings, but the backend expects Map<Long, String>
        const numericAnswers = {};
        for (const [key, value] of Object.entries(answers)) {
            numericAnswers[Number(key)] = value;
        }

        const body = {
            courseId: Number(courseId),
            answers: numericAnswers,
        };

        console.log("Submitting quiz payload:", JSON.stringify(body));

        // Primary endpoint from StudentController: POST /api/student/submit
        const response = await api.post('/student/submit', body);
        return response.data;
    },

    getEnrolledClassrooms: async () => {
        // FIX: Correct endpoint from StudentController is /student/my-classrooms
        const response = await api.get('/student/my-classrooms');
        return response.data;
    },
};