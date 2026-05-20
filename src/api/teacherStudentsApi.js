import api from './axiosConfig';

/** @returns {Promise<import('../types/analyticsTypes').StudentSummaryDTO[]>} */
export async function fetchClassroomStudents(classroomId) {
    const { data } = await api.get(`/teacher/classrooms/${classroomId}/students`);
    return data;
}

/** @param {number} classroomId @param {number} studentId */
export async function removeClassroomStudent(classroomId, studentId) {
    await api.delete(`/teacher/classrooms/${classroomId}/students/${studentId}`);
}
