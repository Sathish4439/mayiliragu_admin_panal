import { useState, useMemo } from 'react';
import { 
  useStudentsList, 
  useStudentEnrollments, 
  useEnrollStudent, 
  useRevokeEnrollment,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  type Student
} from '../api/enrollments';
import { useCoursesList } from '../../courses/api/courses';
import { 
  Search, 
  User, 
  BookOpen, 
  Plus, 
  Trash2, 
  Loader2, 
  Mail, 
  Calendar, 
  BookMarked,
  X,
  GraduationCap,
  AlertCircle,
  Pencil,
  Trash
} from 'lucide-react';

import { getAvailableCourses } from '../../../core/utils';
import StudentFormModal from '../components/StudentFormModal';
import ConfirmModal from '../../../shared/components/ConfirmModal';

export default function StudentManagementPage() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [isRevokingId, setIsRevokingId] = useState<string | null>(null);
  const [isEnrollingId, setIsEnrollingId] = useState<string | null>(null);
  
  // Student Form & Delete States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Queries
  const { data: students = [], isLoading: isStudentsLoading, isError: isStudentsError, refetch: refetchStudents } = useStudentsList();
  const { data: enrollments = [], isLoading: isEnrollmentsLoading } = useStudentEnrollments(selectedStudent?.id ?? '');
  const { data: coursesData } = useCoursesList(1, 50);

  // Mutations
  const enrollMutation = useEnrollStudent();
  const revokeMutation = useRevokeEnrollment(selectedStudent?.id ?? '');
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const deleteStudentMutation = useDeleteStudent();

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  // Set of enrolled course IDs for filtering
  const enrolledCourseIds = useMemo(() => {
    return new Set(enrollments.map((e) => e.courseId));
  }, [enrollments]);

  // Filter courses available for enrollment
  const availableCourses = useMemo(() => {
    const allCourses = coursesData?.data ?? [];
    const filtered = getAvailableCourses(allCourses, enrolledCourseIds);
    if (!courseSearchQuery) return filtered;
    return filtered.filter((c) =>
      c.title.toLowerCase().includes(courseSearchQuery.toLowerCase())
    );
  }, [coursesData, enrolledCourseIds, courseSearchQuery]);

  const handleEnroll = async (courseId: string) => {
    if (!selectedStudent) return;
    setIsEnrollingId(courseId);
    try {
      await enrollMutation.mutateAsync({
        studentId: selectedStudent.id,
        courseId,
      });
      setIsEnrollDialogOpen(false);
      setCourseSearchQuery('');
    } catch (err) {
      console.error('Failed to enroll student:', err);
    } finally {
      setIsEnrollingId(null);
    }
  };

  const handleRevoke = async (enrollmentId: string, courseTitle: string) => {
    if (!selectedStudent) return;
    if (window.confirm(`Are you sure you want to revoke enrollment for course "${courseTitle}"?`)) {
      setIsRevokingId(enrollmentId);
      try {
        await revokeMutation.mutateAsync(enrollmentId);
      } catch (err) {
        console.error('Failed to revoke enrollment:', err);
      } finally {
        setIsRevokingId(null);
      }
    }
  };

  const handleFormSubmit = async (data: { name: string; email: string; password?: string }) => {
    if (editingStudent) {
      const updated = await updateStudentMutation.mutateAsync({
        id: editingStudent.id,
        data,
      });
      if (selectedStudent?.id === editingStudent.id) {
        setSelectedStudent(updated);
      }
    } else {
      const newStudent = await createStudentMutation.mutateAsync(data);
      setSelectedStudent(newStudent);
    }
  };

  const handleDeleteStudent = (student: Student) => {
    setStudentToDelete(student);
  };

  const handleConfirmDeleteStudent = async () => {
    if (studentToDelete) {
      await deleteStudentMutation.mutateAsync(studentToDelete.id);
      if (selectedStudent?.id === studentToDelete.id) {
        setSelectedStudent(null);
      }
    }
  };

  if (isStudentsError) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-12 bg-red-50 border border-red-200 rounded-3xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-red-800">Failed to Load Students</h2>
        <button
          onClick={() => refetchStudents()}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-gradient-to-br from-background-start via-[#EFF5FF] to-background-end animate-fade-in">
      
      {/* Master Column - Left Panel */}
      <div className="w-full border-r border-border/60 md:w-5/12 lg:w-4/12 flex flex-col bg-cardBg shadow-sm">
        
        {/* Search header */}
        <div className="p-4 sm:p-5 border-b border-border/50 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-text-primary tracking-tight">
              Students Database
            </h2>
            <button
              onClick={() => {
                setEditingStudent(null);
                setIsFormOpen(true);
              }}
              className="flex items-center space-x-1 bg-accent/10 hover:bg-accent/20 text-accent font-bold py-1.5 px-3 rounded-xl text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Student</span>
            </button>
          </div>
          <div className="flex items-center bg-slate-50 border border-border/60 rounded-2xl px-4 py-2.5 shadow-xs">
            <Search className="w-4 h-4 text-gray-400 mr-2.5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-text-primary placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        {/* Student list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isStudentsLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-16 bg-slate-50 border border-border/30 rounded-2xl animate-pulse" />
            ))
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-text-secondary">
              <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-semibold">No students found.</p>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isSelected = selectedStudent?.id === student.id;
              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-accent/5 border-accent text-accent shadow-sm'
                      : 'border-border/40 hover:border-slate-350 hover:bg-slate-50 text-text-primary'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 ${
                      isSelected ? 'bg-accent text-white shadow-md' : 'bg-slate-150 text-text-secondary'
                    }`}>
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-sm truncate group-hover:text-accent transition-colors">
                        {student.name}
                      </p>
                      <p className="text-[11px] text-text-secondary truncate mt-0.5 font-medium">
                        {student.email}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Column - Right Panel */}
      <div className="hidden md:flex md:w-7/12 lg:w-8/12 flex-col overflow-hidden">
        {selectedStudent ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Student profile Header */}
            <div className="p-6 bg-cardBg border-b border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#008A7C] to-[#006A61] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-accent/10">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-text-primary tracking-tight">
                    {selectedStudent.name}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-text-secondary font-semibold">
                    <span className="flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-accent" />
                      <span>{selectedStudent.email}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                      <span>Joined {new Date(selectedStudent.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 self-start sm:self-center">
                <button
                  onClick={() => {
                    setEditingStudent(selectedStudent);
                    setIsFormOpen(true);
                  }}
                  className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-text-primary font-bold py-2.5 px-3.5 rounded-xl text-xs transition-colors active:scale-[0.98]"
                  title="Edit Profile"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteStudent(selectedStudent)}
                  disabled={deleteStudentMutation.isPending}
                  className="flex items-center space-x-1.5 bg-red-50 hover:bg-red-100 text-red-650 font-bold py-2.5 px-3.5 rounded-xl text-xs transition-colors disabled:opacity-50 active:scale-[0.98]"
                  title="Delete Student"
                >
                  {deleteStudentMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash className="w-3.5 h-3.5" />
                  )}
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setIsEnrollDialogOpen(true)}
                  className="flex items-center space-x-1.5 bg-accent hover:bg-accent-onContainer text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-accent/15 transition-all duration-200 active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enroll in Course</span>
                </button>
              </div>
            </div>

            {/* Enrollments table / catalog list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <BookMarked className="w-4 h-4 text-accent" />
                <h4 className="text-sm font-extrabold text-text-primary uppercase tracking-wider">
                  Active Enrollments
                </h4>
              </div>

              {isEnrollmentsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <div key={idx} className="h-20 bg-slate-50 border border-border/30 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : enrollments.length === 0 ? (
                <div className="bg-cardBg border border-border/40 border-dashed rounded-3xl p-12 text-center space-y-2">
                  <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-text-secondary text-sm font-semibold">No active enrollments for this student.</p>
                  <p className="text-xs text-text-secondary">Click "Enroll in Course" to assign them a class.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="bg-cardBg border border-border/60 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-slate-350 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 relative border border-border/45">
                          <img
                            src={enrollment.course.thumbnail}
                            alt={enrollment.course.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-extrabold text-sm text-text-primary tracking-tight truncate">
                            {enrollment.course.title}
                          </h5>
                          <p className="text-[10px] text-text-secondary font-medium mt-0.5">
                            Enrolled {new Date(enrollment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRevoke(enrollment.id, enrollment.course.title)}
                        disabled={isRevokingId === enrollment.id}
                        className="p-2 rounded-xl hover:bg-red-50 text-text-secondary hover:text-red-650 transition-colors disabled:opacity-50"
                        title="Revoke Enrollment"
                      >
                        {isRevokingId === enrollment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-secondary bg-slate-50/20 p-12">
            <GraduationCap className="w-16 h-16 text-gray-300 opacity-60 stroke-[1.5]" />
            <h4 className="mt-4 font-black text-text-primary text-base tracking-tight">No Selection</h4>
            <p className="mt-1 text-xs font-semibold text-center max-w-xs leading-relaxed">
              Select a student from the sidebar directory to configure their syllabus profile and enrollments.
            </p>
          </div>
        )}
      </div>

      {/* Enroll Course modal Dialog */}
      {isEnrollDialogOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-cardBg border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-border/45 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-text-primary tracking-tight">
                  Enroll Student
                </h3>
                <p className="text-xs text-text-secondary font-medium mt-0.5">
                  Select a course to enroll <strong className="text-text-primary">{selectedStudent.name}</strong>.
                </p>
              </div>
              <button 
                onClick={() => { setIsEnrollDialogOpen(false); setCourseSearchQuery(''); }}
                className="p-1 rounded-lg hover:bg-slate-100 text-gray-400 hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Course search bar */}
            <div className="p-4 bg-slate-50/60 border-b border-border/40">
              <div className="flex items-center bg-cardBg border border-border/50 rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Filter available courses..."
                  value={courseSearchQuery}
                  onChange={(e) => setCourseSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-text-primary placeholder-gray-400 outline-none"
                />
              </div>
            </div>

            {/* Courses listing */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {availableCourses.length === 0 ? (
                <p className="text-center text-xs text-text-secondary py-8 font-semibold">
                  No further courses available for enrollment.
                </p>
              ) : (
                availableCourses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => handleEnroll(course.id)}
                    className="p-3 bg-cardBg border border-border/50 hover:border-accent/40 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative border border-border/40">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500';
                          }}
                        />
                      </div>
                      <span className="font-extrabold text-xs text-text-primary truncate group-hover:text-accent transition-colors">
                        {course.title}
                      </span>
                    </div>

                    <button
                      disabled={isEnrollingId === course.id}
                      className="p-1 text-accent group-hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {isEnrollingId === course.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
            
          </div>
        </div>
      )}
      
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleFormSubmit}
        student={editingStudent}
      />

      <ConfirmModal
        isOpen={studentToDelete !== null}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleConfirmDeleteStudent}
        title="Delete Student Profile"
        message={`Are you sure you want to permanently delete student "${studentToDelete?.name}"? All associated enrollments will be revoked.`}
      />

    </div>
  );
}
