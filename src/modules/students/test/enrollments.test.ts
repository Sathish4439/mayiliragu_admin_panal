import { describe, it, expect } from 'vitest';
import { getAvailableCourses } from '../../../core/utils';

describe('Student Enrollment filtering utilities', () => {
  describe('getAvailableCourses', () => {
    const allCourses = [
      { id: 'course-1', title: 'Flutter Basics', thumbnail: '' },
      { id: 'course-2', title: 'React Advanced', thumbnail: '' },
      { id: 'course-3', title: 'NodeJS Fundamentals', thumbnail: '' },
    ];

    it('should return all courses if student has zero enrollments', () => {
      const enrolledIds = new Set<string>();
      const available = getAvailableCourses(allCourses, enrolledIds);
      expect(available).toHaveLength(3);
      expect(available.map(c => c.id)).toEqual(['course-1', 'course-2', 'course-3']);
    });

    it('should exclude courses student is currently enrolled in', () => {
      const enrolledIds = new Set<string>(['course-2']);
      const available = getAvailableCourses(allCourses, enrolledIds);
      expect(available).toHaveLength(2);
      expect(available.map(c => c.id)).toEqual(['course-1', 'course-3']);
    });

    it('should return empty array if student is enrolled in all courses', () => {
      const enrolledIds = new Set<string>(['course-1', 'course-2', 'course-3']);
      const available = getAvailableCourses(allCourses, enrolledIds);
      expect(available).toHaveLength(0);
    });
  });
});
