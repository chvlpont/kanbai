export type TaskStatus = string;

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description?: string;
  position: number;
  status?: TaskStatus; // For compatibility with old code
  assigned_user_ids?: string[]; // Array of user IDs
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

export interface Message {
  id: string;
  board_id: string;
  user_id?: string;
  role: "user" | "assistant";
  content: string;
  actions?: any[];
  action_results?: any[];
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}
