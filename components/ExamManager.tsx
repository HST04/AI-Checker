
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Database } from '../lib/db';
import { Course, Submission, SubmissionStatus } from '../lib/types';
import { Card, Button, Badge, cn } from './ui/Buttons';
import { 
  Upload, ArrowLeft, ChevronRight, Hash, Sparkles, Filter, Database as DbIcon, FileText, Loader2
} from 'lucide-react';
import { InitialCheckAgent } from '../lib/agents/initial-check';

const ExamManager: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      setCourse(Database.getCourseById(id) || null);
      setSubmissions(Database.getSubmissions(id));
    }
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !id || !course) return;
    
    setIsUploading(true);
    // Fix: Explicitly type files as File[] to prevent 'unknown' type errors in the map callback
    const files = Array.from(e.target.files) as File[];
    
    try {
      // Process all files as data URLs and save to DB
      await Promise.all(files.map(file => {
        return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            const newSub: Submission = {
              id: Math.random().toString(36).substring(7),
              examId: id,
              studentName: file.name.split('.')[0],
              rollNumber: `RN-${Math.floor(1000 + Math.random() * 9000)}`,
              examCategory: selectedCategory === 'All' ? (course.testCategories[0] || 'Uncategorized') : selectedCategory,
              imageUrl: base64,
              mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
              status: SubmissionStatus.UPLOADED,
              needsReview: false,
            };
            Database.saveSubmission(newSub);
            resolve();
          };
          reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
          reader.readAsDataURL(file);
        });
      }));
      
      // Refresh local state after all uploads finish
      setSubmissions(Database.getSubmissions(id));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Some files failed to upload. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const runPipeline = async () => {
    if (!course) return;
    setIsProcessing(true);
    const pending = submissions.filter(s => s.status === SubmissionStatus.UPLOADED);
    for (const sub of pending) {
      await InitialCheckAgent.run(sub);
      setSubmissions(Database.getSubmissions(course.id));
    }
    setIsProcessing(false);
  };

  if (!course) return <div className="p-20 text-center font-bold text-[#9988A1]">Course not found.</div>;

  const filteredSubmissions = selectedCategory === 'All' ? submissions : submissions.filter(s => s.examCategory === selectedCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Refined Manager Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[#9988A1]/10">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2.5 bg-white border border-[#9988A1]/20 rounded-xl hover:bg-[#FDF8F3] transition-all shadow-sm text-[#8A2B0E]">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="text-[10px] font-bold text-[#E35336] uppercase tracking-widest mb-0.5">Manager</div>
            <h1 className="text-2xl font-extrabold text-[#8A2B0E]">{course.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9988A1]/60" size={14} />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-[#9988A1]/20 rounded-lg text-xs font-bold text-[#8A2B0E] outline-none focus:border-[#E35336] transition-all"
            >
              <option value="All">All Categories</option>
              {course.testCategories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
            </select>
          </div>
          <Button onClick={() => fileInputRef.current?.click()} size="sm" isLoading={isUploading}>
            {isUploading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Upload size={16} className="mr-2" />}
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            multiple 
            accept="image/*,application/pdf" 
            disabled={isUploading}
          />
        </div>
      </section>

      <div className="grid grid-cols-12 gap-8">
        {/* Scripts List */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <h2 className="text-[11px] font-bold text-[#9988A1] uppercase tracking-wider flex items-center gap-2">
            Submissions
            <span className="flex-1 h-px bg-[#9988A1]/10"></span>
          </h2>

          <div className="space-y-3">
            {isUploading && (
              <div className="flex items-center justify-center p-8 bg-white/50 border-2 border-dashed border-[#E35336]/20 rounded-2xl animate-pulse">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-[#E35336]" size={24} />
                  <span className="text-xs font-bold text-[#8A2B0E] uppercase tracking-widest">Ingesting files...</span>
                </div>
              </div>
            )}
            
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((sub, idx) => (
                <Card key={sub.id} className="p-4 flex items-center justify-between group hover:border-[#E35336]/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#FDF8F3] rounded-lg flex items-center justify-center font-bold text-xs text-[#8A2B0E] border border-[#9988A1]/10">
                      {sub.mimeType === 'application/pdf' ? <FileText size={18} /> : (idx + 1)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#4A3731]">{sub.studentName}</h3>
                      <div className="text-[10px] font-medium text-[#9988A1] uppercase tracking-wide flex items-center gap-2 mt-0.5">
                        <Hash size={10} /> {sub.rollNumber} 
                        <span className="w-1 h-1 bg-[#9988A1]/20 rounded-full"></span>
                        {sub.examCategory}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#8A2B0E]">
                        {sub.totalMarks || 0}
                        <span className="text-[9px] text-[#9988A1] ml-1 font-bold">PTS</span>
                      </div>
                    </div>
                    <Link to={`/exams/${course.id}/grading`}>
                      <Button variant="outline" size="sm" className="px-3">
                        <ChevronRight size={16} />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            ) : !isUploading && (
              <div className="py-12 text-center text-[#9988A1]/40 text-sm font-medium bg-white rounded-2xl border border-dashed">
                No submissions uploaded for this course yet.
              </div>
            )}
          </div>
        </div>

        {/* Process Side Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card className="p-6 bg-[#8A2B0E] text-white">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">Automation</span>
                <Badge variant="success" className="bg-[#E35336] text-white border-none py-1">Ready</Badge>
              </div>
              <p className="text-xs font-medium leading-relaxed opacity-90">
                Run the AI pipeline to analyze handwriting and extract student information from uploaded files.
              </p>
              <Button className="w-full bg-white text-[#8A2B0E] hover:bg-[#FDF8F3] font-bold" onClick={runPipeline} isLoading={isProcessing}>
                <Sparkles size={16} className="mr-2" />
                Process Batch
              </Button>
            </div>
          </Card>

          <div className="p-8 bg-white rounded-2xl border-2 border-dashed border-[#9988A1]/10 hover:border-[#E35336]/20 transition-all cursor-pointer text-center group">
             <DbIcon size={32} className="mx-auto mb-4 text-[#9988A1]/20 group-hover:text-[#E35336]/40 transition-colors" />
             <h4 className="text-xs font-bold text-[#8A2B0E] uppercase tracking-wide">Sync Master Roster</h4>
             <p className="text-[9px] text-[#9988A1] font-bold uppercase mt-1 tracking-widest">Import CSV</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamManager;
