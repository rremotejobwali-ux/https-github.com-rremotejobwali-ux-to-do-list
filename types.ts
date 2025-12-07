export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  subtasks: Subtask[];
  isExpanded: boolean; // For showing subtasks
}

export type FilterType = 'all' | 'active' | 'completed';

export interface IconProps {
  className?: string;
  size?: number;
}