import api from './axiosConfig';

export const teacherApi = {
    // Fetch all classrooms created by this teacher
    getClassrooms: async () => {
        const response = await api.get('/teacher/classrooms');
        return response.data;
    },
    // Fetch all courses inside a specific classroom
    getCoursesByClassroom: async (classroomId) => {
        const response = await api.get(`/teacher/classrooms/${classroomId}/courses`);
        return response.data;
    },
    
    // Classrooms
    createClassroom: async (name) => {
        const response = await api.post('/teacher/classrooms', { name });
        return response.data; // Returns the Classroom object with the generated inviteCode
    },

    // Courses
    createCourse: async (title, description, classroomId) => {
        const response = await api.post('/teacher/courses', {
            title,
            description,
            classroomId
        });
        return response.data;
    },

    // Course Content
    addCourseContent: async (contentType, bodyText, mediaUrl, courseId) => {
        const response = await api.post('/teacher/contents', {
            contentType, // e.g., "TEXT", "VIDEO"
            bodyText,
            mediaUrl,
            courseId
        });
        return response.data;
    },

    // Questions
    addQuestion: async (questionText, correctAnswer, optionsArray, courseId) => {
        const response = await api.post('/teacher/questions', {
            questionText,
            correctAnswer,
            // Convert the JavaScript array into a JSON string since the backend expects a String
            options: JSON.stringify(optionsArray), 
            courseId
        });
        return response.data;
    }
};