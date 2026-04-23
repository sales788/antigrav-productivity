import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '../lib/supabase.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const DEMO_TASKS = [
  { id: '1', title: 'Design new landing page', description: 'Create wireframes and mockups', priority: 'high', deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], project_id: 'p1', parent_task_id: null, is_completed: false, created_at: new Date().toISOString() },
  { id: '2', title: 'Review pull requests', description: '', priority: 'medium', deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0], project_id: 'p1', parent_task_id: null, is_completed: false, created_at: new Date().toISOString() },
  { id: '3', title: 'Write documentation', description: 'API docs for v2', priority: 'low', deadline: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], project_id: 'p1', parent_task_id: null, is_completed: true, created_at: new Date().toISOString() },
  { id: '4', title: 'Fix navigation bug', description: '', priority: 'high', deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0], project_id: 'p2', parent_task_id: null, is_completed: false, created_at: new Date().toISOString() },
];

const DEMO_PROJECTS = [
  { id: 'p1', name: 'Website Redesign', color: '#6c63ff' },
  { id: 'p2', name: 'Mobile App', color: '#00d4aa' },
];

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (isDemoMode || !user) {
      setTasks(JSON.parse(localStorage.getItem('antigrav-tasks') || 'null') || DEMO_TASKS);
      setProjects(JSON.parse(localStorage.getItem('antigrav-projects') || 'null') || DEMO_PROJECTS);
      setLoading(false);
      return;
    }
    try {
      const { data: t } = await supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at');
      setTasks(t || []);
      const { data: p } = await supabase.from('projects').select('*').eq('user_id', user.id);
      setProjects(p || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const saveLocal = (t, p) => {
    localStorage.setItem('antigrav-tasks', JSON.stringify(t));
    if (p) localStorage.setItem('antigrav-projects', JSON.stringify(p));
  };

  const addTask = async (task) => {
    const newTask = { ...task, id: crypto.randomUUID(), is_completed: false, created_at: new Date().toISOString() };
    if (isDemoMode || !user) {
      const updated = [...tasks, newTask];
      setTasks(updated);
      saveLocal(updated, projects);
      return newTask;
    }
    const { data } = await supabase.from('tasks').insert({ ...task, user_id: user.id }).select().single();
    setTasks(prev => [...prev, data]);
    return data;
  };

  const updateTask = async (id, updates) => {
    if (isDemoMode || !user) {
      const updated = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
      setTasks(updated);
      saveLocal(updated, projects);
      return;
    }
    await supabase.from('tasks').update(updates).eq('id', id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = async (id) => {
    if (isDemoMode || !user) {
      const updated = tasks.filter(t => t.id !== id && t.parent_task_id !== id);
      setTasks(updated);
      saveLocal(updated, projects);
      return;
    }
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(prev => prev.filter(t => t.id !== id && t.parent_task_id !== id));
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) await updateTask(id, { is_completed: !task.is_completed });
  };

  const addProject = async (project) => {
    const newProject = { ...project, id: crypto.randomUUID() };
    if (isDemoMode || !user) {
      const updated = [...projects, newProject];
      setProjects(updated);
      saveLocal(tasks, updated);
      return newProject;
    }
    const { data } = await supabase.from('projects').insert({ ...project, user_id: user.id }).select().single();
    setProjects(prev => [...prev, data]);
    return data;
  };

  const getSubtasks = (parentId) => tasks.filter(t => t.parent_task_id === parentId);

  return { tasks, projects, loading, addTask, updateTask, deleteTask, toggleTask, addProject, getSubtasks, refetch: fetchTasks };
}
