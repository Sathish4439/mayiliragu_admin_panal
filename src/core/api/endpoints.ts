import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { ApiConstants } from '../constants';

// Re-export apiClient for convenience
export { apiClient };

import type { 
  Lesson, 
  Module, 
  Course, 
  CoursesListResponse, 
  Student, 
  Enrollment, 
  Question, 
  QuestionStats,
  Test,
  Banner
} from '../types';

export type { 
  Lesson, 
  Module, 
  Course, 
  CoursesListResponse, 
  Student, 
  Enrollment, 
  Question, 
  QuestionStats,
  Test,
  Banner
};

// ==========================================
// DASHBOARD HOOKS
// ==========================================

export function useAdminStats() {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await apiClient.get(ApiConstants.dashboard.admin);
      return response.data;
    },
  });
}

// ==========================================
// COURSES HOOKS
// ==========================================

export function useCoursesList(page: number, limit: number) {
  return useQuery<CoursesListResponse>({
    queryKey: ['courses', page, limit],
    queryFn: async () => {
      const response = await apiClient.get(ApiConstants.courses.base, {
        params: { page, limit },
      });
      return response.data;
    },
  });
}

export function useCourseDetail(courseId: string) {
  return useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const response = await apiClient.get(ApiConstants.courses.detail(courseId));
      return response.data;
    },
    enabled: !!courseId,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description: string; thumbnail: string }) => {
      const response = await apiClient.post(ApiConstants.courses.base, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Course> }) => {
      const response = await apiClient.put(ApiConstants.courses.detail(id), data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.id] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(ApiConstants.courses.detail(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// ==========================================
// MODULES HOOKS
// ==========================================

export function useCreateModule(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; order: number }) => {
      const response = await apiClient.post(ApiConstants.modules.base, { ...data, courseId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
}

export function useUpdateModule(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title?: string; order?: number } }) => {
      const response = await apiClient.put(ApiConstants.modules.detail(id), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
}

export function useDeleteModule(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(ApiConstants.modules.detail(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
}

// ==========================================
// LESSONS HOOKS
// ==========================================

export function useCreateLesson(courseId: string, moduleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description: string; driveFileId: string; duration: number; order: number }) => {
      const response = await apiClient.post(ApiConstants.lessons.base, { ...data, moduleId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
}

export function useUpdateLesson(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title?: string; description?: string; driveFileId?: string; duration?: number; order?: number } }) => {
      const response = await apiClient.put(ApiConstants.lessons.detail(id), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
}

export function useDeleteLesson(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(ApiConstants.lessons.detail(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
}

// ==========================================
// STUDENTS & ENROLLMENTS HOOKS
// ==========================================

export function useStudentsList() {
  return useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await apiClient.get(ApiConstants.students.list);
      return response.data.data;
    },
  });
}

export function useStudentEnrollments(studentId: string) {
  return useQuery<Enrollment[]>({
    queryKey: ['studentEnrollments', studentId],
    queryFn: async () => {
      const response = await apiClient.get(ApiConstants.students.enrollments(studentId));
      return response.data.data;
    },
    enabled: !!studentId,
  });
}

export function useEnrollStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, courseId }: { studentId: string; courseId: string }) => {
      const response = await apiClient.post(ApiConstants.students.enroll, { studentId, courseId });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['studentEnrollments', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
}

export function useRevokeEnrollment(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const response = await apiClient.delete(ApiConstants.students.revoke(enrollmentId));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentEnrollments', studentId] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post(ApiConstants.students.base, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(ApiConstants.students.detail(id), data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['studentEnrollments', variables.id] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(ApiConstants.students.detail(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
}

// ==========================================
// QUESTIONS & TESTS HOOKS
// ==========================================

export function useQuestionsList(filters: {
  subject?: string;
  type?: string;
  difficulty?: string;
  search?: string;
}) {
  return useQuery<Question[]>({
    queryKey: ['questions', filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.subject && filters.subject !== 'All Subjects') {
        params.subject = filters.subject;
      }
      if (filters.type && filters.type !== 'All Types') {
        params.type = filters.type;
      }
      if (filters.difficulty && filters.difficulty !== 'Difficulty: All') {
        params.difficulty = filters.difficulty;
      }
      if (filters.search) {
        params.search = filters.search;
      }
      const response = await apiClient.get(ApiConstants.questions.base, { params });
      return response.data.data;
    },
  });
}

export function useQuestionStats() {
  return useQuery<QuestionStats>({
    queryKey: ['questionStats'],
    queryFn: async () => {
      const response = await apiClient.get(ApiConstants.questions.stats);
      return response.data.data;
    },
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Partial<Question>, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await apiClient.post(ApiConstants.questions.base, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['questionStats'] });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Question> }) => {
      const response = await apiClient.put(ApiConstants.questions.detail(id), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['questionStats'] });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(ApiConstants.questions.detail(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['questionStats'] });
    },
  });
}

// ==========================================
// TESTS & TEST BUILDER ENDPOINTS
// ==========================================

export function useTestsList(filters?: { categoryId?: string; courseId?: string }) {
  return useQuery<Test[]>({
    queryKey: ['tests', filters],
    queryFn: async () => {
      const response = await apiClient.get(ApiConstants.tests.base, { params: filters });
      return response.data.data;
    },
  });
}

export function useTestDetail(id?: string) {
  return useQuery<Test>({
    queryKey: ['test', id],
    queryFn: async () => {
      if (!id) throw new Error('Test ID is required');
      const response = await apiClient.get(ApiConstants.tests.detail(id));
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post(ApiConstants.tests.base, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });
}

export function useUpdateTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(ApiConstants.tests.detail(id), data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.invalidateQueries({ queryKey: ['test', variables.id] });
    },
  });
}

export function useDeleteTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(ApiConstants.tests.detail(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });
}

// ==========================================
// BANNERS HOOKS
// ==========================================

export function useBannersAdminList() {
  return useQuery<Banner[]>({
    queryKey: ['bannersAdmin'],
    queryFn: async () => {
      const response = await apiClient.get(ApiConstants.banners.admin);
      return response.data;
    },
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; imageUrl: string; linkUrl?: string | null; order: number; isActive: boolean }) => {
      const response = await apiClient.post(ApiConstants.banners.base, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bannersAdmin'] });
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Banner> }) => {
      const response = await apiClient.put(ApiConstants.banners.detail(id), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bannersAdmin'] });
    },
  });
}

export function useToggleBannerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(ApiConstants.banners.toggle(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bannersAdmin'] });
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(ApiConstants.banners.detail(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bannersAdmin'] });
    },
  });
}
