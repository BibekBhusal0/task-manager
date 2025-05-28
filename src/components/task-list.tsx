import React from "react";
import { Card, CardBody, Divider } from "@heroui/react";
import { useTaskStore } from "../store/task-store";
import { AnimatePresence } from "framer-motion";
import { TaskListItem } from "./task-list-item";

export const TaskList: React.FC = () => {
  const { tasks, filter, viewOptions } = useTaskStore();

  // Filter tasks based on current filter settings
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
    <Card>
      <CardBody className="p-0">
        <div
        >
          <AnimatePresence>
            {filteredTasks.map((task, index) => (
              <React.Fragment key={task.id}>
                <TaskListItem task={task} viewOptions={viewOptions} />
                {index < filteredTasks.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </AnimatePresence>

          {filteredTasks.length === 0 && (
            <div className="py-12 text-center text-default-400">No tasks match your filters</div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

