import api from './axiosConfig';

/** @returns {Promise<import('../types/analyticsTypes').StudentAnalyticsResponse>} */
export async function fetchStudentAnalytics() {
    const { data } = await api.get('/analytics/student');
    return data;
}

/** @returns {Promise<import('../types/analyticsTypes').TeacherCourseStatsResponse>} */
export async function fetchTeacherCourseStats(courseId) {
    const { data } = await api.get(`/analytics/teacher/courses/${courseId}`);
    return data;
}

/** @returns {Promise<import('../types/analyticsTypes').LeaderboardEntryResponse[]>} */
export async function fetchCourseLeaderboard(courseId) {
    const { data } = await api.get(`/analytics/leaderboard/courses/${courseId}`);
    return data;
}
