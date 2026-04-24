import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '../lib/supabase.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const DEMO_HABITS = [
  { id: '1', title: 'Morning Meditation', category: 'mindfulness', frequency: 'daily', days_of_week: [0,1,2,3,4,5,6], color: '#6c63ff', streak: 7, created_at: new Date().toISOString() },
  { id: '2', title: 'Exercise', category: 'fitness', frequency: 'weekly', days_of_week: [1,3,5], color: '#00d4aa', streak: 12, created_at: new Date().toISOString() },
  { id: '3', title: 'Read 30 min', category: 'education', frequency: 'daily', days_of_week: [0,1,2,3,4,5,6], color: '#ffa726', streak: 5, created_at: new Date().toISOString() },
  { id: '4', title: 'Drink 8 glasses of water', category: 'health', frequency: 'daily', days_of_week: [0,1,2,3,4,5,6], color: '#4ecdc4', streak: 3, created_at: new Date().toISOString() },
];

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    if (isDemoMode || !user) {
      setHabits(JSON.parse(localStorage.getItem('antigrav-habits') || 'null') || DEMO_HABITS);
      setHabitLogs(JSON.parse(localStorage.getItem('antigrav-habit-logs') || '[]'));
      setLoading(false);
      return;
    }
    try {
      const { data } = await supabase.from('habits').select('*').eq('user_id', user.id).order('created_at');
      setHabits(data || []);
      const { data: logs } = await supabase.from('habit_logs').select('*')
        .in('habit_id', (data || []).map(h => h.id));
      setHabitLogs(logs || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  // Sync to localStorage
  useEffect(() => {
    if (isDemoMode || !user) {
      localStorage.setItem('antigrav-habits', JSON.stringify(habits));
      localStorage.setItem('antigrav-habit-logs', JSON.stringify(habitLogs));
    }
  }, [habits, habitLogs, user]);

  const addHabit = async (habit) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
    const newHabit = { ...habit, id, streak: 0, created_at: new Date().toISOString() };
    
    if (isDemoMode || !user) {
      setHabits(prev => [...prev, newHabit]);
      return newHabit;
    }
    
    try {
      const { data, error } = await supabase.from('habits').insert({ ...habit, user_id: user.id }).select().single();
      if (error) throw error;
      if (data) {
        setHabits(prev => [...prev, data]);
        return data;
      }
    } catch (err) {
      console.error('Error adding habit:', err);
      throw err;
    }
  };

  const updateHabit = async (id, updates) => {
    if (isDemoMode || !user) {
      setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
      return;
    }
    try {
      const { error } = await supabase.from('habits').update(updates).eq('id', id);
      if (error) throw error;
      setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
    } catch (err) { console.error(err); }
  };

  const deleteHabit = async (id) => {
    if (isDemoMode || !user) {
      setHabits(prev => prev.filter(h => h.id !== id));
      return;
    }
    try {
      const { error } = await supabase.from('habits').delete().eq('id', id);
      if (error) throw error;
      setHabits(prev => prev.filter(h => h.id !== id));
    } catch (err) { console.error(err); }
  };

  const toggleDayLog = async (habitId, date) => {
    const dateStr = date || new Date().toISOString().split('T')[0];
    const existing = habitLogs.find(l => l.habit_id === habitId && l.completed_at?.startsWith(dateStr));
    
    if (existing) {
      if (isDemoMode || !user) {
        setHabitLogs(prev => prev.filter(l => l.id !== existing.id));
        return;
      }
      try {
        const { error } = await supabase.from('habit_logs').delete().eq('id', existing.id);
        if (error) throw error;
        setHabitLogs(prev => prev.filter(l => l.id !== existing.id));
      } catch (err) { console.error(err); }
    } else {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
      const newLog = { id, habit_id: habitId, completed_at: dateStr + 'T00:00:00' };
      if (isDemoMode || !user) {
        setHabitLogs(prev => [...prev, newLog]);
        return;
      }
      try {
        const { data, error } = await supabase.from('habit_logs').insert({ habit_id: habitId, completed_at: dateStr }).select().single();
        if (error) throw error;
        if (data) setHabitLogs(prev => [...prev, data]);
      } catch (err) { console.error(err); }
    }
  };

  const isHabitCompleted = (habitId, date) => {
    if (!habitLogs) return false;
    const dateStr = date || new Date().toISOString().split('T')[0];
    return habitLogs.some(l => l && l.habit_id === habitId && l.completed_at?.startsWith(dateStr));
  };

  return { habits: habits || [], habitLogs: habitLogs || [], loading, addHabit, updateHabit, deleteHabit, toggleHabitLog: toggleDayLog, isHabitCompleted, refetch: fetchHabits };
}
