import React from "react";
import { Tabs, Tab, Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useTaskStore } from "../store/task-store";
import { FilterToolbar } from "./filter-toolbar";
import { KanbanBoard } from "./kanban-board";
import { TaskList } from "./task-list";
import { TaskTable } from "./task-table";
import { ViewOptions } from "./view-options";

export const TaskDashboard: React.FC = () => {
  const { tasks, viewType, setViewType, filter } = useTaskStore();
  const [isViewOptionsOpen, setIsViewOptionsOpen] = React.useState(false);

  const filteredTasks = React.useMemo(() => {
    let filtered = tasks.filter((task) => {
      // Filter by search term
      if (filter.search && !task.title.toLowerCase().includes(filter.search.toLowerCase())) {
        return false;
      }

      // Filter by tags
      if (filter.tags.length > 0 && !task.tags.some((tag) => filter.tags.includes(tag))) {
        return false;
      }

      // Filter by assigned user
      if (filter.assignedTo && task.assignedTo !== filter.assignedTo) {
        return false;
      }

      return true;
    });

    // Sort tasks
    filtered = filtered.sort((a, b) => {
      if (filter.sortBy === "createdAt") {
        return filter.sortDirection === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (filter.sortBy === "dueDate") {
        if (!a.dueDate) return filter.sortDirection === "asc" ? 1 : -1;
        if (!b.dueDate) return filter.sortDirection === "asc" ? -1 : 1;
        return filter.sortDirection === "asc"
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else if (filter.sortBy === "priority") {
        const priorityValue = { low: 1, medium: 2, high: 3 };
        return filter.sortDirection === "asc"
          ? priorityValue[a.priority] - priorityValue[b.priority]
          : priorityValue[b.priority] - priorityValue[a.priority];
      }
      return 0;
    });

    return filtered;
  }, [tasks, filter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <div className="flex items-center gap-2">
            <Tabs
              aria-label="View options"
              selectedKey={viewType}
              onSelectionChange={(key) => setViewType(key as any)}
              radius="full"
              size="sm"
            >
              <Tab
                key="kanban"
                title={
                  <div className="flex items-center gap-1">
                    <Icon icon="lucide:layout-grid" className="text-sm" />
                    <span className="hidden sm:inline">Kanban</span>
                  </div>
                }
              />
              <Tab
                key="list"
                title={
                  <div className="flex items-center gap-1">
                    <Icon icon="lucide:list" className="text-sm" />
                    <span className="hidden sm:inline">List</span>
                  </div>
                }
              />
              <Tab
                key="table"
                title={
                  <div className="flex items-center gap-1">
                    <Icon icon="lucide:table" className="text-sm" />
                    <span className="hidden sm:inline">Table</span>
                  </div>
                }
              />
            </Tabs>
            <Tooltip content="View options">
              <Button
                isIconOnly
                variant="flat"
                size="sm"
                onPress={() => setIsViewOptionsOpen(true)}
              >
                <Icon icon="lucide:sliders-horizontal" className="text-sm" />
              </Button>
            </Tooltip>
          </div>
        </div>
        <FilterToolbar />
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={viewType}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          {viewType === "kanban" && <KanbanBoard filteredTasks={filteredTasks} />}
          {viewType === "list" && <TaskList filteredTasks={filteredTasks} />}
          {viewType === "table" && <TaskTable filteredTasks={filteredTasks} />}
        </motion.div>
      </AnimatePresence>

      <ViewOptions isOpen={isViewOptionsOpen} onClose={() => setIsViewOptionsOpen(false)} />
    </div>
  );
};
