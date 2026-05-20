/**
 * @typedef {Object} StudentAnalyticsResponse
 * @property {number} totalQuestionsAttempted
 * @property {number} totalCorrect
 * @property {number} totalWrong
 * @property {number} totalTimeMs
 * @property {CourseAnalyticsEntry[]} byCourse
 */

/**
 * @typedef {Object} CourseAnalyticsEntry
 * @property {number} courseId
 * @property {string} courseTitle
 * @property {number} questionsAttempted
 * @property {number} correctCount
 * @property {number} wrongCount
 * @property {number} problemsSolved
 * @property {number} totalTimeMs
 */

/**
 * @typedef {Object} TeacherCourseStatsResponse
 * @property {number} courseId
 * @property {string} courseTitle
 * @property {number} totalEnrolledStudents
 * @property {TeacherStudentStatsEntry[]} students
 */

/**
 * @typedef {Object} TeacherStudentStatsEntry
 * @property {number} rank
 * @property {number} studentId
 * @property {string} studentName
 * @property {string} studentEmail
 * @property {number} questionsAttempted
 * @property {number} correctCount
 * @property {number} wrongCount
 * @property {number} totalTimeMs
 */

/**
 * @typedef {Object} LeaderboardEntryResponse
 * @property {number} rank
 * @property {number} studentId
 * @property {string} studentName
 * @property {number} questionsAttempted
 * @property {number} correctCount
 * @property {number} totalTimeMs
 */

/**
 * @typedef {Object} StudentSummaryDTO
 * @property {number} id
 * @property {string} name
 * @property {string} email
 */

export {};
