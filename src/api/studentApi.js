import api from './axiosConfig';

export const studentApi = {
    // Enroll using the 6-digit code
    enroll: async (inviteCode) => {
        const response = await api.post('/student/enroll', { inviteCode });
        return response.data; // Returns success string message
    },

    // Fetch learning material
    getCourseContent: async (courseId) => {
        const response = await api.get(`/student/courses/${courseId}/content`);
        return response.data; // Returns array of CourseContent objects
    },

    // Fetch quiz questions
    getCourseQuestions: async (courseId) => {
        const response = await api.get(`/student/courses/${courseId}/questions`);
        return response.data; // Returns array of Question objects (correctAnswer hidden)
    },

    // Submit quiz for grading — answersMap: { "questionId": "A"|"B"|"C"|"D" }
    submitQuiz: async (courseId, answersMap) => {
        const response = await api.post('/student/submit', {
            courseId: courseId,
            answers: answersMap,
        });
        return response.data; // Returns "Course completed! You scored: X%"
    },
    // Fetch classrooms the student has joined
    getEnrolledClassrooms: async () => {
        const response = await api.get('/student/classrooms');
        return response.data;
    }
};