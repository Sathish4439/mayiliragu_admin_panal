export type Role = 'ADMIN' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  driveFileId: string;
  duration: number; // in seconds
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  totalLessons?: number;
  modules?: Module[];
  createdAt: string;
  updatedAt: string;
}

export interface CoursesListResponse {
  data: Course[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface Student {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface EnrollmentCourse {
  id: string;
  title: string;
  thumbnail: string;
  isDeleted: boolean;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  course: EnrollmentCourse;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  type: string;
  question_text_en: string;
  question_text_ta?: string;
  subject_id?: string;
  topic_id?: string;
  exam_category: string;
  difficulty: string;
  explanation_en?: string;
  explanation_ta?: string;
  marks: {
    correct: number;
    wrong: number;
    partial: number;
    negative_enabled: boolean;
  };
  tags: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  options?: any;
  correct_option_id?: string;
  correct_option_ids?: any;
  partial_marking_enabled?: boolean;
  correct_answer?: boolean;
  accepted_answers?: any;
  hint?: string;
  max_characters?: number;
}

export interface QuestionStats {
  total: number;
  published: number;
  draft: number;
  subjects: number;
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  duration: number;
  cutoff_marks: number;
  total_marks: number;
  course_id?: string;
  module_id?: string;
  category_id?: string;
  subject_id?: string;
  topic_id?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  question_count?: number;
  questions?: (Question & { order: number })[];
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
