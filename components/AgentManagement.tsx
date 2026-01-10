
import React, { useState, useEffect } from 'react';
import { Database } from '../lib/db';
import { AgentConfig, Course } from '../lib/types';
import { Card, Button, Badge, cn } from './ui/Buttons';
import { Bot, Save, Edit3, Settings2, Sparkles, CheckCircle } from 'lucide-react';

const AgentManagement: React.FC = () => {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('global');
  const [editingAgent, setEditingAgent] = useState<AgentConfig | null>(null);

  useEffect(() => {
    setCourses(Database.getCourses());
    loadAgents('global');
  }, []);

  const loadAgents = (courseId: string) => {
    if (courseId === 'global') {
      setAgents(Database.getGlobalAgents());
    } else {
      const course = Database.getCourseById(courseId);
      const globals = Database.getGlobalAgents();
      // Merge globals with course overrides
      const merged = globals.map(g => course?.agentSettings?.[g.id] || g);
      setAgents(merged);
    }
    setSelectedCourseId(courseId);
  };

  const handleSave = () => {
    if (!editingAgent) return;

    if (selectedCourseId === 'global') {
      Database.saveGlobalAgent(editingAgent);
    } else {
      const course = Database.getCourseById(selectedCourseId);
      if (course) {
        const updatedCourse = {
          ...course,
          agentSettings: {
            ...(course.agentSettings || {}),
            [editingAgent.id]: editingAgent
          }
        };
        Database.saveCourse(updatedCourse);
      }
    }
    
    setEditingAgent(null);
    loadAgents(selectedCourseId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">AI Agent Center</h1>
          <p className="text-slate-500">Configure system instructions and models for your grading agents.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Configure for:</label>
          <select 
            className="bg-white border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={selectedCourseId}
            onChange={(e) => loadAgents(e.target.value)}
          >
            <option value="global">Global Defaults</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Bot size={24} />
              </div>
              <Badge variant={agent.active ? 'success' : 'default'}>
                {agent.active ? 'Active' : 'Disabled'}
              </Badge>
            </div>
            <h3 className="font-bold text-lg mb-1">{agent.name}</h3>
            <p className="text-xs text-slate-400 mb-4 uppercase tracking-wider font-semibold">Model: {agent.model}</p>
            
            <div className="flex-1 bg-slate-50 rounded-lg p-3 text-sm text-slate-600 mb-6 italic leading-relaxed line-clamp-4">
              "{agent.systemInstruction}"
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setEditingAgent({...agent})}
            >
              <Settings2 size={16} className="mr-2" />
              Configure Agent
            </Button>
          </Card>
        ))}
      </div>

      {editingAgent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Edit3 className="text-blue-600" size={20} />
                Edit {editingAgent.name}
              </h2>
              <Badge variant="default">
                {selectedCourseId === 'global' ? 'Global Default' : 'Course Override'}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block uppercase tracking-tighter">System Instruction</label>
                <p className="text-xs text-slate-500 mb-2">This prompt defines the agent's behavior and personality.</p>
                <textarea 
                  className="w-full h-48 p-4 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editingAgent.systemInstruction}
                  onChange={(e) => setEditingAgent({...editingAgent, systemInstruction: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block uppercase tracking-tighter">Model Selection</label>
                  <select 
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                    value={editingAgent.model}
                    onChange={(e) => setEditingAgent({...editingAgent, model: e.target.value})}
                  >
                    <option value="gemini-3-pro-preview">Gemini 3 Pro (Vision Optimized)</option>
                    <option value="gemini-3-flash-preview">Gemini 3 Flash (Fast & Lean)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block uppercase tracking-tighter">Status</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600" 
                      checked={editingAgent.active}
                      onChange={(e) => setEditingAgent({...editingAgent, active: e.target.checked})}
                    />
                    <span className="text-sm font-medium">Agent Enabled</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="ghost" onClick={() => setEditingAgent(null)}>Cancel</Button>
              <Button onClick={handleSave}>
                <Save size={16} className="mr-2" />
                Apply Configuration
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AgentManagement;
