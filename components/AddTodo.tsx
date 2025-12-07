import React, { useState } from 'react';
import { PlusIcon } from './Icons';

interface AddTodoProps {
  onAdd: (title: string) => void;
}

const AddTodo: React.FC<AddTodoProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative mb-6">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
        <PlusIcon size={24} />
      </div>
      <input
        type="text"
        placeholder="Add a new task..."
        className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-lg placeholder:text-slate-400 transition-all"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button 
        type="submit"
        disabled={!title.trim()}
        className="absolute right-3 top-3 bottom-3 px-4 bg-primary text-white rounded-xl font-medium shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all"
      >
        Add
      </button>
    </form>
  );
};

export default AddTodo;