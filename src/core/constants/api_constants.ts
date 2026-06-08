export const ApiConstants = {
  baseUrl: (import.meta.env.VITE_API_BASE_URL as string) || (import.meta.env.VITE_API_URL as string) || 'http://192.168.0.142:5000/api',
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  dashboard: {
    admin: '/dashboard/admin',
  },
  courses: {
    base: '/courses',
    detail: (courseId: string) => `/courses/${courseId}`,
  },
  modules: {
    base: '/modules',
    detail: (moduleId: string) => `/modules/${moduleId}`,
    swap: '/modules/sort/swap',
  },
  lessons: {
    base: '/lessons',
    detail: (lessonId: string) => `/lessons/${lessonId}`,
    swap: '/lessons/sort/swap',
  },
  students: {
    base: '/enrollments/students',
    list: '/enrollments/students',
    detail: (studentId: string) => `/enrollments/students/${studentId}`,
    enrollments: (studentId: string) => `/enrollments/student/${studentId}`,
    enroll: '/enrollments',
    revoke: (enrollmentId: string) => `/enrollments/${enrollmentId}`,
  },
  questions: {
    base: '/questions',
    detail: (questionId: string) => `/questions/${questionId}`,
    stats: '/questions/stats',
  },
  tests: {
    base: '/tests',
    detail: (testId: string) => `/tests/${testId}`,
    categories: '/tests/categories',
    subjects: '/tests/subjects',
    topics: '/tests/topics',
    analytics: '/tests/analytics/stats',
    attemptsAll: '/tests/attempts/all',
  },
  banners: {
    base: '/banners',
    admin: '/banners/admin',
    detail: (id: string) => `/banners/${id}`,
    toggle: (id: string) => `/banners/${id}/toggle`,
  },
} as const;
