/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  Clock, 
  X,
  Layout,
  CheckCircle2,
  Settings,
  Search,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Status } from './types';

// Storage Key
const STORAGE_KEY = 'zenkanban_tasks';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [boardLoaded, setBoardLoaded] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority']
  });

  // Load from LocalStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Failed to parse tasks from localStorage", e);
      }
    }
    setBoardLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (boardLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, boardLoaded]);

  const handleAddTask = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', priority: 'medium' });
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority
    });
    setIsModalOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTask) {
      setTasks(prev => prev.map(t => 
        t.id === editingTask.id 
          ? { ...t, title: formData.title, description: formData.description, priority: formData.priority } 
          : t
      ));
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: formData.title,
        description: formData.description,
        status: 'todo',
        priority: formData.priority,
        createdAt: Date.now()
      };
      setTasks(prev => [...prev, newTask]);
    }
    setIsModalOpen(false);
  };

  const moveTask = (id: string, newStatus: Status) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const columns: { title: string; status: Status }[] = [
    { title: 'To Do', status: 'todo' },
    { title: 'In Progress', status: 'in-progress' },
    { title: 'Done', status: 'done' }
  ];

  return (
    <div className="flex h-screen bg-bg-main text-slate-50 overflow-hidden">
      {/* Sidebar - Inspired by Elegant Dark design */}
      <aside className="w-16 bg-bg-nav border-r border-border-dark flex flex-col items-center py-6 gap-6">
        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold">Z</div>
        <div className="flex flex-col gap-4 mt-6">
          <SidebarIcon icon={Layout} active />
          <SidebarIcon icon={CheckCircle2} />
          <SidebarIcon icon={Hash} />
          <SidebarIcon icon={Settings} />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <nav className="h-16 bg-bg-nav border-b border-border-dark flex items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-brand rounded-full"></div>
            <span className="text-lg font-bold tracking-tight">IssueTracker Pro</span>
          </div>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
            <input 
              type="text" 
              placeholder="Search tasks, bugs, or features..."
              className="bg-[#171717] border border-[#262626] rounded-md px-10 py-1.5 text-xs text-text-dim w-72 focus:outline-none focus:border-brand/50 transition-colors"
            />
          </div>

          <button 
            onClick={handleAddTask}
            className="bg-brand text-white px-5 py-1.5 rounded-md text-xs font-semibold hover:opacity-90 transition-opacity active:scale-95 cursor-pointer"
          >
            + Create Issue
          </button>
        </nav>

        {/* Board Area */}
        <main className="flex-1 overflow-x-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-w-[900px]">
            {columns.map(col => (
              <div key={col.status} className="flex flex-col min-w-0">
                <div className="flex items-center justify-between mb-4 border-b border-border-dark pb-3">
                  <h2 className="text-[12px] font-bold uppercase tracking-widest text-text-header">{col.title}</h2>
                  <span className="bg-[#1e293b] text-text-dim text-[11px] px-2 py-0.5 rounded-full font-bold">
                    {tasks.filter(t => t.status === col.status).length}
                  </span>
                </div>
                
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar pb-6">
                  <AnimatePresence mode="popLayout">
                    {tasks
                      .filter(t => t.status === col.status)
                      .map(task => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          onEdit={handleEditTask} 
                          onDelete={handleDeleteTask}
                          onMove={moveTask}
                        />
                      ))}
                  </AnimatePresence>
                  
                  {tasks.filter(t => t.status === col.status).length === 0 && (
                    <div className="border border-dashed border-border-dark rounded-xl p-8 flex flex-col items-center justify-center text-text-dim/50 italic bg-white/5">
                      <p className="text-xs">No active tasks</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-bg-nav border border-border-dark w-full max-w-md rounded-xl shadow-2xl overflow-hidden p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold tracking-tight">
                  {editingTask ? 'Update Issue' : 'Create New Issue'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-text-dim hover:text-slate-50 transition-colors p-1">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-header mb-2">Headline</label>
                  <input 
                    type="text" 
                    autoFocus
                    required
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="Refactor Auth middleware..."
                    className="w-full bg-[#171717] border border-[#262626] rounded-md px-4 py-2.5 text-sm text-slate-50 focus:outline-none focus:border-brand/50 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-header mb-2">Details</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe the issue scope..."
                    className="w-full bg-[#171717] border border-[#262626] rounded-md px-4 py-2.5 text-sm text-slate-50 focus:outline-none focus:border-brand/50 transition-all min-h-[100px] resize-none font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-header mb-2">Priority</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as Task['priority'][]).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                        className={`flex-1 py-1.5 px-3 rounded-md border text-[11px] font-bold uppercase tracking-wider transition-all ${
                          formData.priority === p 
                            ? 'bg-brand/20 border-brand text-brand' 
                            : 'bg-[#171717] border-[#262626] text-text-dim hover:border-text-header'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-brand text-white py-2.5 rounded-md font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    {editingTask ? 'Save Changes' : 'Create Issue'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarIcon({ icon: Icon, active = false }: { icon: any; active?: boolean }) {
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${active ? 'bg-[#1e293b] text-white' : 'text-text-dim hover:bg-white/5'}`}>
      <Icon size={18} />
    </div>
  );
}

function TaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onMove 
}: { 
  task: Task; 
  onEdit: (t: Task) => void; 
  onDelete: (id: string) => void;
  onMove: (id: string, s: Status) => void;
  key?: string;
}) {
  const getPriorityClasses = (p: Task['priority']) => {
    switch(p) {
      case 'high': return 'bg-[#f97316]/10 text-[#f97316]';
      case 'medium': return 'bg-[#10b981]/10 text-[#10b981]';
      case 'low': return 'bg-[#3b82f6]/10 text-[#3b82f6]';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  const nextStatus = task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'done' : null;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: task.status === 'done' ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-bg-card border border-border-dark rounded-xl p-4 transition-all hover:border-border-dark/80 hover:shadow-lg"
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-sm font-bold text-card-title leading-snug pr-6">
          {task.title}
        </h4>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4">
          <button onClick={() => onEdit(task)} className="p-1 hover:bg-white/5 rounded text-text-dim hover:text-slate-50 transition-colors">
            <Edit3 size={13} />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 hover:bg-red-500/10 rounded text-text-dim hover:text-red-500 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-text-dim line-clamp-2 mb-4 leading-relaxed font-medium">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${getPriorityClasses(task.priority)}`}>
          {task.priority}
        </span>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-text-dim/60">
            <Clock size={11} />
            <span className="text-[10px] font-bold">
              {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
          
          {nextStatus && (
            <button 
              onClick={() => onMove(task.id, nextStatus)}
              className="text-brand hover:text-brand/80 p-0.5 transition-colors"
              title="Next Status"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
