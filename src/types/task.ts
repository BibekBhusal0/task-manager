export type TaskStatus = "todo" | "in-progress" | "done";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  tags: string[];
  dueDate: string | null;
  assignedTo: string | null;
  priority: TaskPriority;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

export interface ViewOptions {
  showTags: boolean;
  showAssignee: boolean;
  showDueDate: boolean;
  showPriority: boolean;
}

export type ViewType = "kanban" | "list" | "table";

export interface TaskFilter {
  search: string;
  tags: string[];
  assignedTo: string | null;
  sortBy: "createdAt" | "dueDate" | "priority";
  sortDirection: "asc" | "desc";
}
