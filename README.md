# Focus Platform UI

React + Vite frontend for the Focus learning platform. Connects to the Spring Boot backend for classrooms, courses, quizzes, analytics, and leaderboards.

## Setup

```bash
npm install
npm run dev
```

App runs at [http://localhost:5173](http://localhost:5173). The dev server proxies `/api` to `http://localhost:8080` unless you set `VITE_API_BASE_URL`.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | *(empty — uses `/api` proxy)* | Backend origin, e.g. `http://localhost:8080`. Requests go to `{base}/api/...` with cookies (`withCredentials`). |

Copy `.env.example` to `.env.local` to override.

## Auth

- HttpOnly `jwt` cookie after login (`credentials: include`)
- Roles: `STUDENT`, `TEACHER`
- User id stored when returned by login (for leaderboard “You” highlight)

## Routes

| Route | Role | API |
|-------|------|-----|
| `/login`, `/register` | Public | Auth |
| `/teacher/dashboard` | Teacher | Classrooms |
| `/teacher/classroom/:classroomId` | Teacher | Courses, content, questions, **student roster** |
| `/teacher/courses/:courseId/analytics` | Teacher | `GET /api/analytics/teacher/courses/:courseId` |
| `/teacher/courses/:courseId/leaderboard` | Teacher | `GET /api/analytics/leaderboard/courses/:courseId` |
| `/student/dashboard` | Student | Enroll, classrooms |
| `/student/analytics` | Student | `GET /api/analytics/student` |
| `/student/course/:courseId` | Student | Course player / quiz |
| `/student/course/:courseId/leaderboard` | Student | Leaderboard |

## Analytics API module

Typed helpers in `src/api/analyticsApi.js`:

- `fetchStudentAnalytics()`
- `fetchTeacherCourseStats(courseId)`
- `fetchCourseLeaderboard(courseId)`

Classroom students: `src/api/teacherStudentsApi.js`

## Theme

Use the moon/sun control in the navbar to switch light/dark mode. Preference is saved in `localStorage` (`focus_theme`).

## Build

```bash
npm run build
npm run preview
```

For production, serve the built app behind the same host as the API or set `VITE_API_BASE_URL` to your backend URL.
