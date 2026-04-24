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

  // Sync to localStorage
  useEffect(() => {
    if (isDemoMode || !user) {
      localStorage.setItem('antigrav-tasks', JSON.stringify(tasks));
      localStorage.setItem('antigrav-projects', JSON.stringify(projects));
    }
  }, [tasks, projects, user]);

  const addTask = async (task) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
    const newTask = { ...task, id, is_completed: false, created_at: new Date().toISOString() };
    if (isDemoMode || !user) {
      setTasks(prev => [...prev, newTask]);
      return newTask;
    }
    try {
      const { data, error } = await supabase.from('tasks').insert({ ...task, user_id: user.id }).select().single();
      if (error) throw error;
      if (data) {
        setTasks(prev => [...prev, data]);
        return data;
      }
    } catch (err) {
      console.error('Error adding task:', err);
      throw err;
    }
  };

  const updateTask = async (id, updates) => {
    if (isDemoMode || !user) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      return;
    }
    try {
      const { error } = await supabase.from('tasks').update(updates).eq('id', id);
      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (err) { console.error(err); }
  };

  const deleteTask = async (id) => {
    if (isDemoMode || !user) {
      setTasks(prev => prev.filter(t => t.id !== id && t.parent_task_id !== id));
      return;
    }
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== id && t.parent_task_id !== id));
    } catch (err) { console.error(err); }
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) await updateTask(id, { is_completed: !task.is_completed });
  };

  const addProject = async (project) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
    const newProject = { ...project, id };
    if (isDemoMode || !user) {
      setProjects(prev => [...prev, newProject]);
      return newProject;
    }
    try {
      const { data, error } = await supabase.from('projects').insert({ ...project, user_id: user.id }).select().single();
      if (error) throw error;
      if (data) {
        setProjects(prev => [...prev, data]);
        return data;
      }
    } catch (err) {
      console.error('Error adding project:', err);
      throw err;
    }
  };

  const getSubtasks = (parentId) => (tasks || []).filter(t => t && t.parent_task_id === parentId);

  return { tasks: tasks || [], projects: projects || [], loading, addTask, updateTask, deleteTask, toggleTask, addProject, getSubtasks, refetch: fetchTasks };
}
