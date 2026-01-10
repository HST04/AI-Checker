
import React, { useState, useEffect } from 'react';
import { Database } from '../lib/db';
import { Course, ActivityLog, SubmissionStatus } from '../lib/types';
import { Card, Button, Badge, cn } from './ui/Buttons';
import { 
  Plus, AlertCircle, UploadCloud, ChevronRight, BarChart3, Check, Download, UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PREDEFINED_CATEGORIES = [
  'Quiz', 'Midterm', 'Final Exam', 'Lab Report', 'Assignment', 'Project', 'Oral Exam'
];

const Dashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metrics, setMetrics] = useState({ pendingReview: 0, awaitingUpload: 0, awaitingReview: 0 });
  
  // Global student roll number for identification/export validation
  const [sessionRollNumber, setSessionRollNumber] = useState('');

  const [newCourse, setNewCourse] = useState({
    title: '', 
    subject: '', 
    academicYear: '2024-2025', 
    numStudents: 30, 
    studentRollNumber: '',
    testCategories: ['Final Exam'] as string[]
  });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const loadedCourses = Database.getCourses();
    setCourses(loadedCourses);
    setActivities(Database.getActivityLogs());
    let pending = 0, awaitingReview = 0;
    loadedCourses.forEach(c => {
      const subs = Database.getSubmissions(c.id);
      pending += subs.filter(s => s.status === SubmissionStatus.NEEDS_REVIEW).length;
      awaitingReview += subs.filter(s => s.status === SubmissionStatus.UPLOADED).length;
    });
    setMetrics({ pendingReview: pending, awaitingUpload: loadedCourses.length * 5, awaitingReview: awaitingReview });
  };

  const handleExport = (course: Course) => {
    if (!sessionRollNumber.trim()) return;

    const subs = Database.getSubmissions(course.id);
    if (subs.length === 0) {
      alert("No marks found to export for this course.");
      return;
    }

    const headers = "Student Name,Roll Number,Category,Status,Total Marks\n";
    const rows = subs.map(s => {
      return `"${s.studentName}","${s.rollNumber || ''}","${s.examCategory || ''}","${s.status}","${s.totalMarks || 0}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${course.title.replace(/\s+/g, '_')}_Marks_${sessionRollNumber}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Database.logActivity(`Exported marks for course: ${course.title} (ID: ${sessionRollNumber})`);
  };

  const toggleCategory = (cat: string) => {
    setNewCourse(prev => {
      const exists = prev.testCategories.includes(cat);
      if (exists) {
        return { ...prev, testCategories: prev.testCategories.filter(c => c !== cat) };
      } else {
        return { ...prev, testCategories: [...prev.testCategories, cat] };
      }
    });
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCourse.testCategories.length === 0) {
      alert("Please select at least one exam category.");
      return;
    }
    const id = Math.random().toString(36).substring(7);
    Database.saveCourse({ 
      ...newCourse, 
      id, 
      teacherId: Database.currentUser.id, 
      createdAt: Date.now(), 
      questions: [{ id: 'q1', text: "Sample Question", maxMarks: 10, rubric: "Standard rubric", gradingPolicy: "Be fair." }] 
    });
    refreshData();
    setIsModalOpen(false);
    setNewCourse({
      title: '', subject: '', academicYear: '2024-2025', numStudents: 30, studentRollNumber: '', testCategories: ['Final Exam']
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Global Identification */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#8A2B0E]">Dashboard</h1>
            <p className="text-[#9988A1] text-sm font-medium tracking-tight">System overview and institutional command center.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} size="md">
            <Plus size={18} className="mr-2" />
            New Course
          </Button>
        </div>

        {/* Identification Section */}
        <Card className="p-5 border-dashed bg-white border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <UserCheck size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Active Identification</h3>
                <p className="text-[10px] text-slate-400 font-medium">Verify roll number to enable data exports.</p>
              </div>
            </div>
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Enter Student Roll Number (Required for Export)"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                value={sessionRollNumber}
                onChange={(e) => setSessionRollNumber(e.target.value)}
              />
            </div>
            {sessionRollNumber && (
              <Badge variant="success" className="h-fit py-1.5 px-3">
                <Check size={12} className="mr-1" /> Identification Active
              </Badge>
            )}
          </div>
        </Card>
      </section>

      {/* Balanced Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Pending Review', value: metrics.pendingReview, icon: AlertCircle, color: 'text-[#E35336]' },
          { label: 'Awaiting Upload', value: metrics.awaitingUpload, icon: UploadCloud, color: 'text-[#8A2B0E]' },
          { label: 'Verified Graded', value: metrics.awaitingReview, icon: BarChart3, color: 'text-[#9988A1]' }
        ].map((m, i) => (
          <Card key={i} className="p-6 flex items-center gap-4 group hover:border-[#E35336]/20 transition-all">
            <div className={cn("p-3 rounded-xl bg-black/5", m.color)}>
              <m.icon size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#4A3731]">{m.value}</div>
              <div className="text-[10px] font-bold text-[#9988A1] uppercase tracking-wider">{m.label}</div>
            </div>
          </Card>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Course Inventory */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-sm font-bold text-[#9988A1] uppercase tracking-widest">Active Courses</h2>
            <div className="flex-1 h-px bg-[#9988A1]/10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <Card key={course.id} className="p-6 flex flex-col justify-between hover:shadow-md transition-all group/card">
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <Badge>{course.subject}</Badge>
                    {course.testCategories?.slice(0, 2).map(cat => (
                      <Badge key={cat} variant="default" className="opacity-60">{cat}</Badge>
                    ))}
                  </div>
                  <h3 className="text-lg font-bold text-[#8A2B0E] leading-snug">{course.title}</h3>
                  <p className="text-xs text-[#9988A1] mt-1 font-medium">{course.academicYear} • {course.numStudents} Students</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link to={`/exams/${course.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Open Manager
                      <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "px-3 border border-slate-100 hover:bg-slate-50 transition-all",
                      !sessionRollNumber.trim() ? "opacity-30 cursor-not-allowed" : "text-[#8A2B0E]"
                    )}
                    onClick={() => handleExport(course)}
                    disabled={!sessionRollNumber.trim()}
                    title={!sessionRollNumber.trim() ? "Enter Student Roll Number to enable export" : "Export Marks for this course"}
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline ml-2 text-[10px] font-bold uppercase">Export</span>
                  </Button>
                </div>
              </Card>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                 <p className="text-slate-400 text-sm font-medium">No courses available. Create one to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-sm font-bold text-[#9988A1] uppercase tracking-widest">Activity</h2>
            <div className="flex-1 h-px bg-[#9988A1]/10"></div>
          </div>
          
          <Card className="p-6">
            <div className="space-y-6">
              {activities.length > 0 ? (
                activities.slice(0, 6).map((log) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="mt-1 shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#E35336]"></div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#4A3731]">{log.action}</div>
                      <div className="text-[10px] text-[#9988A1] mt-1">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-[#9988A1]/40 text-xs font-medium">No activity recorded.</div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* New Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <Card className="max-w-xl w-full p-8 space-y-6 animate-in zoom-in-95 duration-200 shadow-xl overflow-y-auto max-h-[90vh] bg-white border border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans">New Course</h2>
              <p className="text-slate-500 text-xs">Define parameters and exam types for your environment.</p>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Course Title</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none transition-all bg-white text-slate-900" 
                    placeholder="e.g. Introduction to Bio-Chemistry" 
                    value={newCourse.title} 
                    onChange={e => setNewCourse({...newCourse, title: e.target.value})} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Subject</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none transition-all bg-white text-slate-900" 
                      placeholder="Science" 
                      value={newCourse.subject} 
                      onChange={e => setNewCourse({...newCourse, subject: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Students</label>
                    <input 
                      required 
                      type="number" 
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none transition-all bg-white text-slate-900" 
                      value={newCourse.numStudents} 
                      onChange={e => setNewCourse({...newCourse, numStudents: parseInt(e.target.value)})} 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-3">Exam Classifications</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PREDEFINED_CATEGORIES.map(cat => {
                      const isSelected = newCourse.testCategories.includes(cat);
                      return (
                        <div 
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={cn(
                            "cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between group bg-white",
                            isSelected 
                              ? "border-slate-900 ring-1 ring-slate-900" 
                              : "border-slate-200 hover:border-slate-400"
                          )}
                        >
                          <span className={cn(
                            "text-[11px] font-bold tracking-tight transition-colors",
                            isSelected ? "text-slate-900" : "text-slate-500"
                          )}>{cat}</span>
                          <div className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center transition-all bg-white",
                            isSelected ? "border-slate-900" : "border-slate-200 group-hover:border-slate-400"
                          )}>
                            {isSelected && <Check size={10} className="text-slate-900 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="ghost" className="flex-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
                <Button className="flex-1 bg-slate-900 text-white hover:bg-slate-800" type="submit">Create Course</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
