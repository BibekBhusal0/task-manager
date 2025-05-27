import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Task, TaskStatus, TeamMember, ViewOptions, ViewType, TaskFilter } from "../types/task";

interface TaskState {
  tasks: Task[];
  members: TeamMember[];
  viewType: ViewType;
  viewOptions: ViewOptions;
  filter: TaskFilter;
  selectedMember: TeamMember | null;

  // Actions
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  setViewType: (viewType: ViewType) => void;
  updateViewOptions: (options: Partial<ViewOptions>) => void;
  updateFilter: (filter: Partial<TaskFilter>) => void;
  selectMember: (member: TeamMember) => void;
  clearSelectedMember: () => void;
}

// Sample team members
const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "Alex Johnson",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=1",
    isOnline: true,
  },
  {
    id: "2",
    name: "Sam Taylor",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=2",
    isOnline: false,
  },
  {
    id: "3",
    name: "Jordan Lee",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=3",
    isOnline: true,
  },
  {
    id: "4",
    name: "Casey Morgan",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=4",
    isOnline: true,
  },
  {
    id: "5",
    name: "Riley Smith",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=5",
    isOnline: false,
  },
];

// Sample tasks
const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Update user dashboard",
    description: "Implement new analytics widgets on the main dashboard",
    status: "todo",
    tags: ["feature", "frontend"],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: "1",
    priority: "medium",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Fix login page bug",
    description: "Users are experiencing intermittent login failures",
    status: "in-progress",
    tags: ["bug", "urgent"],
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: "3",
    priority: "high",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-3",
    title: "Implement dark mode",
    description: "Add dark mode support to all pages",
    status: "done",
    tags: ["feature", "ui"],
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: "2",
    priority: "low",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-4",
    title: "Optimize API endpoints",
    description: "Improve performance of key API endpoints",
    status: "in-progress",
    tags: ["backend", "performance"],
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: "4",
    priority: "medium",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-5",
    title: "Write documentation",
    description: "Create user documentation for new features",
    status: "todo",
    tags: ["docs"],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: "5",
    priority: "low",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-6",
    title: "Implement authentication",
    description: "Add OAuth support for social login",
    status: "done",
    tags: ["feature", "security"],
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: "1",
    priority: "high",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: initialTasks,
      members: initialMembers,
      viewType: "kanban",
      viewOptions: {
        showTags: true,
        showAssignee: true,
        showDueDate: true,
        showPriority: true,
      },
      filter: {
        search: "",
        tags: [],
        assignedTo: null,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
      selectedMember: null,

      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

      updateTask: (taskId, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
        })),

      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        })),

      moveTask: (taskId, newStatus) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          ),
        })),

      setViewType: (viewType) => set({ viewType }),

      updateViewOptions: (options) =>
        set((state) => ({
          viewOptions: { ...state.viewOptions, ...options },
        })),

      updateFilter: (filter) =>
        set((state) => ({
          filter: { ...state.filter, ...filter },
        })),

      selectMember: (member) =>
        set({
          selectedMember: member,
          filter: {
            search: "",
            tags: [],
            assignedTo: member.id,
            sortBy: "createdAt",
            sortDirection: "desc",
          },
        }),

      clearSelectedMember: () =>
        set({
          selectedMember: null,
          filter: {
            search: "",
            tags: [],
            assignedTo: null,
            sortBy: "createdAt",
            sortDirection: "desc",
          },
        }),
    }),
    {
      name: "task-store",
    }
  )
);
