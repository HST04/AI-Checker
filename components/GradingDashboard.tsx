
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Database } from '../lib/db';
import { Exam, Submission, Answer } from '../lib/types';
import { Card, Button, Badge, cn } from './ui/Buttons';
import { 
  ChevronLeft, ChevronRight, Sparkles, Send, BrainCircuit, Zap, Scale, PenTool, FileText
} from 'lucide-react';
import { GradingAgent } from '../lib/agents/grading-agent';
import { ProviderRegistry } from '../lib/providers/registry';

const GradingDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isGrading, setIsGrading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [localPolicy, setLocalPolicy] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");
  const [bulkValue, setBulkValue] = useState(1);
  const [bulkMode, setBulkMode] = useState<'add' | 'subtract' | 'set'>('add');

  useEffect(() => {
    if (id) {
      const e = Database.getCourseById(id);
      if (e) {
        setExam(e);
        setLocalPolicy(e.questions[selectedQuestionIndex].gradingPolicy);
        const subs = Database.getSubmissions(id).filter(s => !!s.extractedText);
        setSubmissions(subs);
        const qId = e.questions[selectedQuestionIndex].id;
        setAnswers(Database.getAnswersByQuestion(qId));
      }
    }
  }, [id, selectedQuestionIndex]);

  const handleRefinePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInstruction.trim() || !exam) return;
    setIsRefining(true);
    try {
      const gradingProvider = ProviderRegistry.getGrading();
      const newPolicy = await gradingProvider.refinePolicy(localPolicy, aiInstruction, exam.questions[selectedQuestionIndex].text);
      setLocalPolicy(newPolicy);
      setAiInstruction("");
    } finally { setIsRefining(false); }
  };

  const runGrading = async () => {
    if (!exam) return;
    setIsGrading(true);
    const question = exam.questions[selectedQuestionIndex];
    const updatedExam = { ...exam };
    updatedExam.questions[selectedQuestionIndex].gradingPolicy = localPolicy;
    Database.saveCourse(updatedExam);
    await GradingAgent.gradeAllForQuestion(exam, question);
    setAnswers(Database.getAnswersByQuestion(question.id));
    setIsGrading(false);
  };

  const updateOverride = (ans: Answer, newMarks: number) => {
    const capped = Math.min(Math.max(0, newMarks), exam?.questions[selectedQuestionIndex].maxMarks || 100);
    const updated = { ...ans, marks: capped, isOverride: true };
    Database.saveAnswer(updated);
    setAnswers(prev => prev.map(a => a.id === ans.id ? updated : a));
  };

  if (!exam) return <div className="p-20 text-center text-[#9988A1] font-bold uppercase tracking-widest">Environment Error</div>;
  const currentQuestion = exam.questions[selectedQuestionIndex];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Workspace Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-[#9988A1]/10">
        <div className="flex items-center gap-4">
          <Link to={`/exams/${exam.id}`} className="p-2.5 bg-white border border-[#9988A1]/20 rounded-xl hover:bg-[#FDF8F3] transition-all shadow-sm text-[#8A2B0E]">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="text-[10px] font-bold text-[#E35336] uppercase tracking-widest mb-0.5">Assessment</div>
            <h1 className="text-xl font-extrabold text-[#8A2B0E]">Question {selectedQuestionIndex + 1}</h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] font-bold text-[#9988A1] uppercase tracking-widest">Progress</div>
            <div className="text-sm font-bold text-[#8A2B0E]">{selectedQuestionIndex + 1} / {exam.questions.length}</div>
          </div>
          <div className="flex gap-1.5">
            <Button variant="outline" className="w-9 h-9 p-0" disabled={selectedQuestionIndex === 0} onClick={() => setSelectedQuestionIndex(p => p - 1)}>
              <ChevronLeft size={18} />
            </Button>
            <Button variant="outline" className="w-9 h-9 p-0" disabled={selectedQuestionIndex === exam.questions.length - 1} onClick={() => setSelectedQuestionIndex(p => p + 1)}>
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-8 items-start">
        
        {/* Left: AI Controls */}
        <div className="col-span-12 lg:col-span-3 space-y-6 sticky top-24">
          <Card className="overflow-hidden bg-white">
            <div className="p-4 bg-[#8A2B0E] text-white flex items-center gap-2">
               <Sparkles size={16} className="text-[#FFD3AC]" />
               <h3 className="font-bold text-[10px] uppercase tracking-widest">AI Logic</h3>
            </div>
            <div className="p-5 space-y-6">
              <form onSubmit={handleRefinePolicy} className="space-y-3">
                <label className="text-[10px] font-bold text-[#9988A1] uppercase tracking-widest block">Update Directive</label>
                <div className="relative">
                  <textarea 
                    className="w-full h-24 text-xs p-3 bg-[#FDF8F3] border border-transparent rounded-lg text-[#8A2B0E] outline-none focus:bg-white focus:border-[#E35336]/30 transition-all resize-none font-bold placeholder:text-[#9988A1]/30"
                    placeholder="Refine policy..."
                    value={aiInstruction}
                    onChange={(e) => setAiInstruction(e.target.value)}
                  />
                  <button type="submit" className="absolute bottom-2 right-2 p-1.5 bg-[#E35336] text-white rounded-md hover:bg-[#8A2B0E] transition-all">
                    <Send size={12} />
                  </button>
                </div>
              </form>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#9988A1] uppercase tracking-widest block">Policy</label>
                <div className="p-3 bg-[#9988A1]/5 rounded-lg text-[10px] font-semibold text-[#8A2B0E]/60 italic leading-relaxed">
                  {localPolicy || "No custom policy applied."}
                </div>
              </div>

              <Button className="w-full text-xs" onClick={runGrading} isLoading={isGrading}>
                Recalculate Batch
              </Button>
            </div>
          </Card>
        </div>

        {/* Center: Stream */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          {submissions.length > 0 ? (
            submissions.map((sub) => {
              const answer = answers.find(a => a.submissionId === sub.id);
              const isPdf = sub.mimeType === 'application/pdf';

              return (
                <Card key={sub.id} className="overflow-hidden hover:shadow-md transition-all">
                  <div className="p-5 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4 w-full">
                         {isPdf ? (
                           <div className="w-14 h-14 rounded-lg bg-red-50 flex items-center justify-center text-red-500 border border-red-100">
                             <FileText size={24} />
                           </div>
                         ) : (
                           <img src={sub.imageUrl} className="w-14 h-14 rounded-lg object-cover border border-[#9988A1]/10" alt="Script" />
                         )}
                         <div className="min-w-0 flex-1">
                           <h3 className="text-sm font-bold text-[#4A3731] truncate">{sub.studentName}</h3>
                           <div className="text-[10px] font-medium text-[#9988A1] uppercase tracking-widest mt-0.5">ID: {sub.rollNumber}</div>
                         </div>
                      </div>
                      {answer && <Badge variant="success">{Math.round(answer.confidence * 100)}% Match</Badge>}
                    </div>

                    {isPdf && (
                      <div className="w-full h-48 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                        <iframe src={sub.imageUrl} className="w-full h-full" title="PDF Preview" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="text-[9px] font-bold text-[#9988A1] uppercase tracking-widest flex items-center gap-2">
                         <BrainCircuit size={10} className="text-[#E35336]" />
                         AI Extract
                      </div>
                      <p className="text-xs text-[#8A2B0E]/70 leading-relaxed font-medium bg-[#FDF8F3] p-4 rounded-xl italic border border-black/5">
                        "{sub.extractedText || "Processing..."}"
                      </p>
                    </div>

                    {answer && (
                      <div className="space-y-6 border-t border-[#9988A1]/5 pt-6 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-2">
                          <div className="text-[9px] font-bold text-[#E35336] uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={10} />
                            Rationale
                          </div>
                          <p className="text-xs font-semibold text-[#4A3731] leading-relaxed">
                            {answer.rationale}
                          </p>
                        </div>

                        <div className="flex items-center justify-between bg-[#FDF8F3] p-4 rounded-xl border border-black/5">
                          <div className="flex items-center gap-4">
                            <input 
                              type="number" 
                              className="w-16 h-10 bg-white border border-black/5 rounded-lg font-bold text-lg text-[#8A2B0E] text-center focus:ring-2 focus:ring-[#E35336]/20 outline-none shadow-sm"
                              value={answer.marks}
                              onChange={(e) => updateOverride(answer, Number(e.target.value))}
                            />
                            <span className="text-[#9988A1] font-bold tracking-widest uppercase text-[9px]">Of {currentQuestion.maxMarks}</span>
                          </div>
                          {answer.isOverride && <Badge className="bg-[#8A2B0E] text-white border-none py-0.5 px-2">Override</Badge>}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="py-20 text-center text-[#9988A1]/40 font-bold uppercase text-xs">No entries to analyze.</div>
          )}
        </div>

        {/* Right: Rubric Reference */}
        <div className="col-span-12 lg:col-span-3 sticky top-24 space-y-6">
          <Card className="p-6 space-y-6 border border-[#8A2B0E]/20 bg-white shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8A2B0E]">Reference</h3>
            <div className="space-y-4">
              <h4 className="text-lg font-bold leading-snug text-[#8A2B0E]">{currentQuestion.text}</h4>
              <Badge className="bg-[#8A2B0E]/5 text-[#8A2B0E] border-none px-2 py-1">Max {currentQuestion.maxMarks} Pts</Badge>
            </div>

            <div className="space-y-4 pt-6 border-t border-[#9988A1]/5">
               <div className="text-[10px] font-bold text-[#9988A1] uppercase tracking-widest flex items-center gap-2">
                 <Scale size={14} className="text-[#E35336]" />
                 Guidelines
               </div>
               <p className="text-[11px] text-[#4A3731]/70 font-medium leading-relaxed italic">
                 {currentQuestion.rubric}
               </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GradingDashboard;
