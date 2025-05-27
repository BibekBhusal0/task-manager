import React from "react";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useTaskStore } from "../store/task-store";
import { TaskCard } from "./task-card";
import { TaskStatus } from "../types/task";
import { motion } from "framer-motion";

const columns: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export const KanbanBoard: React.FC = () => {
  const { tasks, moveTask, filter, viewOptions } = useTaskStore();
  const { animationsEnabled } = useSettingsStore();

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const taskId = active.id as string;
      const newStatus = over.id as TaskStatus;
      moveTask(taskId, newStatus);
    }
  };

  // Filter tasks based on current filter settings
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
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
  }, [tasks, filter]);

  // Group tasks by status
  const tasksByStatus = React.useMemo(() => {
    const grouped = {
      todo: [] as typeof tasks,
      "in-progress": [] as typeof tasks,
      done: [] as typeof tasks,
    };

    filteredTasks.forEach((task) => {
      grouped[task.status].push(task);
    });

    // Sort tasks within each column
    Object.keys(grouped).forEach((status) => {
      grouped[status as TaskStatus] = grouped[status as TaskStatus].sort((a, b) => {
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
    });

    return grouped;
  }, [filteredTasks, filter]);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map((column) => (
          <Card key={column.id} id={column.id} className="h-full">
            <CardHeader className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{column.title}</span>
                <span className="text-sm text-default-400">{tasksByStatus[column.id].length}</span>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="max-h-[calc(100vh-220px)] overflow-y-auto p-3">
              <motion.div
                className="flex flex-col gap-3"
                layout={animationsEnabled ? true : false}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
              >
                {tasksByStatus[column.id].map((task) => (
                  <TaskCard key={task.id} task={task} viewOptions={viewOptions} />
                ))}
                {tasksByStatus[column.id].length === 0 && (
                  <div className="py-8 text-center text-sm text-default-400">No tasks</div>
                )}
              </motion.div>
            </CardBody>
          </Card>
        ))}
      </div>
    </DndContext>
  );
};

import { useSettingsStore } from "../store/settings-store";
