import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Task, TaskStatus, TeamMember, ViewOptions, ViewType, TaskFilter } from "../types/task";
import { initialMembers } from "../data/members";
import { initialTasks } from "../data/tasks";

interface TaskState {
  tasks: Task[];
  members: TeamMember[];
  viewType: ViewType;
  viewOptions: ViewOptions;
  filter: TaskFilter;
  selectedMember: TeamMember | null;
  itemsPerPage: number;

  // Actions
  addTask: (task: Task) => void;
  setItemsPerPage:(n: number) =>void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  changeStatus: (taskId: string, newStatus: TaskStatus) => void;
  setViewType: (viewType: ViewType) => void;
  updateViewOptions: (options: Partial<ViewOptions>) => void;
  updateFilter: (filter: Partial<TaskFilter>) => void;
  selectMember: (member: TeamMember) => void;
  clearSelectedMember: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      itemsPerPage: 20,
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
      setItemsPerPage: (n) => set(() => ({itemsPerPage: n})),

      updateTask: (taskId, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
        })),

      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        })),

      changeStatus: (taskId, newStatus) =>
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
