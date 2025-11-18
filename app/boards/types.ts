export type TaskStatus = string;

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description?: string;
  position: number;
  status?: TaskStatus; // For compatibility with old code
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
  tasks: Task[];
  created_at: string;
}
