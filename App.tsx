import React, { useState, useEffect, useCallback } from 'react';
import { Todo, Subtask, FilterType } from './types';
import TodoItem from './components/TodoItem';
import AddTodo from './components/AddTodo';
import { SparklesIcon } from './components/Icons';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('taskflow-data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [filter, setFilter] = useState<FilterType>('all');

  // Persist to local storage whenever tasks change
  useEffect(() => {
    localStorage.setItem('taskflow-data', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (title: string) => {
    const newTask: Todo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: Date.now(),
      subtasks: [],
      isExpanded: true
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const updateTask = (id: string, title: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, title } : task
    ));
  };

  const addSubtasks = (id: string, newSubtasks: Subtask[]) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, subtasks: [...task.subtasks, ...newSubtasks] } : task
    ));
  };

  const toggleSubtask = (todoId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => {
        if (task.id !== todoId) return task;
        const updatedSubtasks = task.subtasks.map(st => 
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        // Optional: Auto-complete parent if all subtasks are done
        // const allDone = updatedSubtasks.every(st => st.completed);
        return { ...task, subtasks: updatedSubtasks };
    }));
  };

  const toggleExpand = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, isExpanded: !task.isExpanded } : task
    ));
  };

  const clearCompleted = () => {
      setTasks(prev => prev.filter(t => !t.completed));
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const stats = {
      total: tasks.length,
      active: tasks.filter(t => !t.completed).length,
      completed: tasks.filter(t => t.completed).length
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 sm:px-6">
      
      {/* Header */}
      <div className="w-full max-w-2xl mb-8 text-center sm:text-left sm:flex sm:items-end sm:justify-between">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-3">
            <span className="p-2 bg-gradient-to-br from-primary to-secondary text-white rounded-xl shadow-lg shadow-primary/25">
                <SparklesIcon size={24} />
            </span>
            TaskFlow AI
            </h1>
            <p className="text-slate-500 mt-2 ml-1">Organize your day, amplified by intelligence.</p>
        </div>
        <div className="mt-4 sm:mt-0 text-sm font-medium text-slate-400 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            {stats.active} tasks remaining
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-2xl">
        <AddTodo onAdd={addTask} />

        {/* Filters */}
        <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex bg-slate-200/50 p-1 rounded-xl">
                {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                            filter === f 
                                ? 'bg-white text-primary shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>
            {stats.completed > 0 && (
                <button 
                    onClick={clearCompleted}
                    className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors"
                >
                    Clear completed
                </button>
            )}
        </div>

        {/* List */}
        <div className="space-y-1">
            {filteredTasks.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                    <div className="mb-4 flex justify-center text-slate-300">
                        <SparklesIcon size={48} />
                    </div>
                    <p className="text-lg text-slate-800 font-medium">All caught up!</p>
                    <p className="text-slate-500">
                        {filter === 'completed' 
                            ? "No completed tasks yet." 
                            : "Add a task to get started."}
                    </p>
                </div>
            ) : (
                filteredTasks.map(task => (
                    <TodoItem
                        key={task.id}
                        todo={task}
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                        onUpdate={updateTask}
                        onAddSubtasks={addSubtasks}
                        onToggleSubtask={toggleSubtask}
                        onToggleExpand={toggleExpand}
                    />
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default App;