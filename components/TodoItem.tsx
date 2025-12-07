import React, { useState } from 'react';
import { Todo, Subtask } from '../types';
import { CheckIcon, TrashIcon, EditIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon, XIcon, PlusIcon } from './Icons';
import { breakDownTask } from '../services/geminiService';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
  onAddSubtasks: (id: string, subtasks: Subtask[]) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
  onToggleExpand: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ 
  todo, 
  onToggle, 
  onDelete, 
  onUpdate, 
  onAddSubtasks,
  onToggleSubtask,
  onToggleExpand
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = () => {
    if (editValue.trim()) {
      onUpdate(todo.id, editValue.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setEditValue(todo.title);
      setIsEditing(false);
    }
  };

  const handleAiBreakdown = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);
    
    try {
      const subtaskTitles = await breakDownTask(todo.title);
      const newSubtasks: Subtask[] = subtaskTitles.map(title => ({
        id: crypto.randomUUID(),
        title,
        completed: false
      }));
      onAddSubtasks(todo.id, newSubtasks);
      if (!todo.isExpanded) {
        onToggleExpand(todo.id);
      }
    } catch (err) {
      setError("Failed to generate steps. Try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`group mb-3 rounded-xl bg-white shadow-sm border border-slate-100 transition-all duration-200 hover:shadow-md ${todo.completed ? 'opacity-75' : ''}`}>
      <div className="flex items-center p-4 gap-3">
        
        {/* Checkbox */}
        <button
          onClick={() => onToggle(todo.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
            todo.completed 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'border-slate-300 hover:border-emerald-500 text-transparent'
          }`}
          aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          <CheckIcon size={14} strokeWidth={4} />
        </button>

        {/* Content */}
        <div className="flex-grow min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
                <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full bg-slate-50 border border-primary/50 rounded px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button onClick={handleUpdate} className="text-emerald-600 hover:text-emerald-700 p-1">
                    <CheckIcon size={18} />
                </button>
                <button onClick={() => { setIsEditing(false); setEditValue(todo.title); }} className="text-red-500 hover:text-red-600 p-1">
                    <XIcon size={18} />
                </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
                <span 
                    onClick={() => onToggle(todo.id)}
                    className={`cursor-pointer truncate select-none transition-all duration-200 ${
                    todo.completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'
                    }`}
                >
                    {todo.title}
                </span>
                
                {/* Actions */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                    {!todo.completed && (
                        <button 
                            onClick={handleAiBreakdown}
                            disabled={isGenerating}
                            className={`p-2 rounded-lg transition-colors relative ${
                                isGenerating ? 'text-primary animate-pulse' : 'text-slate-400 hover:bg-primary/10 hover:text-primary'
                            }`}
                            title="AI Breakdown"
                        >
                           <SparklesIcon size={18} />
                        </button>
                    )}
                    
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <EditIcon size={18} />
                    </button>
                    
                    <button 
                        onClick={() => onDelete(todo.id)}
                        className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <TrashIcon size={18} />
                    </button>
                </div>
            </div>
          )}
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>

      {/* Subtasks Section */}
      {(todo.subtasks.length > 0 || isGenerating) && (
        <div className="px-4 pb-4">
             <div className="border-t border-slate-100 pt-2">
                <button 
                    onClick={() => onToggleExpand(todo.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-primary mb-2 transition-colors"
                >
                    {todo.isExpanded ? <ChevronUpIcon size={14}/> : <ChevronDownIcon size={14} />}
                    {todo.subtasks.length} subtasks
                </button>

                {todo.isExpanded && (
                    <div className="pl-9 space-y-2 animate-fadeIn">
                        {todo.subtasks.map(subtask => (
                            <div key={subtask.id} className="flex items-center gap-3 text-sm group/sub">
                                <button
                                    onClick={() => onToggleSubtask(todo.id, subtask.id)}
                                    className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                        subtask.completed 
                                        ? 'bg-slate-400 border-slate-400 text-white' 
                                        : 'border-slate-300 hover:border-slate-400 text-transparent'
                                    }`}
                                >
                                    <CheckIcon size={10} strokeWidth={4} />
                                </button>
                                <span className={`${subtask.completed ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                    {subtask.title}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
                 {isGenerating && todo.isExpanded && (
                    <div className="pl-9 text-xs text-primary animate-pulse flex items-center gap-2 mt-2">
                        <SparklesIcon size={12} />
                        Thinking...
                    </div>
                )}
             </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;