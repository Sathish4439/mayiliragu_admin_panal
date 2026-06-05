import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  useCoursesList, 
  useCreateCourse, 
  useUpdateCourse, 
  useDeleteCourse,
  type Course
} from '../api/courses';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  AlertCircle
} from 'lucide-react';

import { courseSchema, type CourseFormValues } from '../../../core/validation';
import ConfirmModal from '../../../shared/components/ConfirmModal';

export default function CourseListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useCoursesList(page, 10);
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourse();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      thumbnail: '',
    },
  });

  const handleOpenCreateDialog = () => {
    setEditingCourse(null);
    reset();
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (course: Course) => {
    setEditingCourse(course);
    setValue('title', course.title);
    setValue('description', course.description);
    setValue('thumbnail', course.thumbnail);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCourse(null);
    reset();
  };

  const onSubmit = async (values: CourseFormValues) => {
    try {
      if (editingCourse) {
        await updateCourseMutation.mutateAsync({
          id: editingCourse.id,
          data: values,
        });
      } else {
        await createCourseMutation.mutateAsync(values);
      }
      handleCloseDialog();
    } catch (err) {
      console.error(err);
    }
  };

  const executeDelete = async (id: string) => {
    setIsDeletingId(id);
    try {
      await deleteCourseMutation.mutateAsync(id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingId(null);
    }
  };

  const filteredCourses = data?.data.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isError) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-12 bg-red-50 border border-red-200 rounded-3xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-red-800">Failed to Load Courses</h2>
        <p className="text-red-600 text-sm">
          Please check your network connection and try again.
        </p>
        <button
          onClick={() => refetch()}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 animate-fade-in relative">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">
            Curriculum Management
          </h1>
          <p className="text-text-secondary text-sm font-medium mt-1">
            Build and schedule courses, modules, and lessons.
          </p>
        </div>
        <button
          onClick={handleOpenCreateDialog}
          className="self-start sm:self-center flex items-center space-x-2 bg-accent hover:bg-accent-onContainer text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/35 transition-all duration-200 active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm">Add Course</span>
        </button>
      </div>

      {/* Filters & search */}
      <div className="flex items-center bg-cardBg border border-border/60 rounded-2xl px-4 py-2.5 max-w-md shadow-sm">
        <Search className="w-5 h-5 text-gray-400 mr-2.5 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search course title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-sm text-text-primary placeholder-gray-400 outline-none"
        />
      </div>

      {/* Main content grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-44 bg-cardBg border border-border/40 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-cardBg border border-border/50 rounded-3xl p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-extrabold text-text-primary text-lg">No Courses Found</h3>
          <p className="text-sm text-text-secondary">
            {searchQuery ? 'Adjust your search queries.' : 'Get started by creating your first course.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-cardBg border border-border/70 rounded-3xl shadow-sm hover:shadow-xl hover:scale-[1.005] hover:border-accent/30 transition-all duration-300 flex overflow-hidden group h-48 cursor-pointer relative"
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              {/* Course Thumbnail */}
              <div className="w-1/3 bg-slate-100 flex-shrink-0 relative overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500';
                  }}
                />
              </div>

              {/* Course details */}
              <div className="w-2/3 p-5 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-widest text-accent uppercase bg-accent/5 px-2.5 py-1 rounded-full">
                      Course
                    </span>
                    
                    {/* Hover controls container */}
                    <div 
                      className="flex items-center space-x-1"
                      onClick={(e) => e.stopPropagation()} // Stop navigation trigger
                    >
                      <button
                        onClick={() => handleOpenEditDialog(course)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-text-secondary hover:text-accent transition-colors"
                        title="Edit Course"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(course.id)}
                        disabled={isDeletingId === course.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-text-secondary hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Delete Course"
                      >
                        {isDeletingId === course.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-extrabold text-text-primary text-base line-clamp-1 group-hover:text-accent transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-text-secondary font-semibold">
                  <div className="flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-accent" />
                    <span>Curriculum Overview</span>
                  </div>
                  <span className="bg-[#EAF2FF] text-[#0A56D1] px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
                    {course.totalLessons ?? 0} Lessons
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination component */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-border/60 rounded-xl bg-cardBg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5 text-text-primary" />
          </button>
          <span className="text-xs font-bold text-text-primary px-4">
            Page {page} of {data.meta.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
            disabled={page === data.meta.totalPages}
            className="p-2 border border-border/60 rounded-xl bg-cardBg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5 text-text-primary" />
          </button>
        </div>
      )}

      {/* CRUD Overlay Dialogue */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-cardBg border border-border/80 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300">
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-text-primary tracking-tight">
                  {editingCourse ? 'Edit Course Details' : 'Create Course'}
                </h3>
                <p className="text-xs text-text-secondary mt-1 font-medium">
                  Provide course details to construct a new curriculum structure.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-text-primary uppercase tracking-wider">
                    Course Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flutter Web Development"
                    {...register('title')}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${
                      errors.title ? 'border-error focus:ring-error focus:border-error bg-red-50/10' : 'border-border focus:ring-accent focus:border-accent'
                    } text-text-primary bg-slate-50/20`}
                  />
                  {errors.title && (
                    <p className="text-[11px] text-error font-semibold pl-1">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-text-primary uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide a summary detailing course learning objectives..."
                    {...register('description')}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all resize-none ${
                      errors.description ? 'border-error focus:ring-error focus:border-error bg-red-50/10' : 'border-border focus:ring-accent focus:border-accent'
                    } text-text-primary bg-slate-50/20`}
                  />
                  {errors.description && (
                    <p className="text-[11px] text-error font-semibold pl-1">{errors.description.message}</p>
                  )}
                </div>

                {/* Thumbnail */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-text-primary uppercase tracking-wider">
                    Thumbnail Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    {...register('thumbnail')}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${
                      errors.thumbnail ? 'border-error focus:ring-error focus:border-error bg-red-50/10' : 'border-border focus:ring-accent focus:border-accent'
                    } text-text-primary bg-slate-50/20`}
                  />
                  {errors.thumbnail && (
                    <p className="text-[11px] text-error font-semibold pl-1">{errors.thumbnail.message}</p>
                  )}
                </div>

                {/* Buttons controls */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border/40">
                  <button
                    type="button"
                    onClick={handleCloseDialog}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-bold text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 bg-accent hover:bg-accent-onContainer text-white font-bold py-2.5 px-5 rounded-xl shadow-md disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <span>{editingCourse ? 'Save Changes' : 'Create'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) executeDelete(confirmDeleteId);
        }}
        title="Delete Course"
        message={`Are you sure you want to delete the course "${
          data?.data.find((c) => c.id === confirmDeleteId)?.title || ''
        }"? All associated modules and lessons will be lost.`}
      />
    </div>
  );
}
