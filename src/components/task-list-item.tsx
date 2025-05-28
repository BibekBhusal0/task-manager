import React from "react";
import {
  Chip,
  Tooltip,
  Avatar,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Task, ViewOptions } from "../types/task";
import { useTaskStore } from "../store/task-store";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "../utils/date-utils";
import { TaskDetailModal } from "./task-detail-modal";
import { TaskActionsDropdown } from "./task-actions-dropdown";

interface TaskListItemProps {
  task: Task;
  viewOptions: ViewOptions;
}

export const TaskListItem: React.FC<TaskListItemProps> = ({ task, viewOptions }) => {
  const { members, } = useTaskStore();
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  // Find assigned member
  const assignedMember = task.assignedTo
    ? members.find((member) => member.id === task.assignedTo)
    : null;

  // Format due date
  const formattedDueDate = task.dueDate ? formatDistanceToNow(new Date(task.dueDate)) : null;

  // Determine if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  // Priority colors
  const priorityColors = {
    low: "success",
    medium: "warning",
    high: "danger",
  };

  // Status colors and icons
  const statusConfig = {
    todo: { color: "default", icon: "lucide:list-todo" },
    "in-progress": { color: "primary", icon: "lucide:loader" },
    done: { color: "success", icon: "lucide:check" },
  };

  return (
    <>
      <motion.div
        // layout={animationsEnabled}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="cursor-pointer p-4 hover:bg-default-50"
        onClick={() => setIsDetailOpen(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center gap-3">
            <Tooltip content={`Status: ${task.status.replace("-", " ")}`}>
              <div className={`text-${statusConfig[task.status].color}`}>
                <Icon icon={statusConfig[task.status].icon} />
              </div>
            </Tooltip>

            <div className="flex-1">
              <h3 className="font-medium">{task.title}</h3>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                {viewOptions.showTags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag) => (
                      <Chip key={tag} size="sm" variant="flat" className="text-xs">
                        #{tag}
                      </Chip>
                    ))}
                  </div>
                )}

                {viewOptions.showPriority && (
                  <Tooltip content={`Priority: ${task.priority}`}>
                    <Chip
                      size="sm"
                      color={priorityColors[task.priority] as any}
                      variant="dot"
                      className="text-xs"
                    >
                      {task.priority}
                    </Chip>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {viewOptions.showDueDate && formattedDueDate && (
              <Chip
                size="sm"
                variant="flat"
                color={isOverdue ? "danger" : "default"}
                startContent={<Icon icon="lucide:clock" className="text-xs" />}
                className="text-xs"
              >
                {formattedDueDate}
              </Chip>
            )}

            {viewOptions.showAssignee && assignedMember && (
              <Tooltip content={assignedMember.name}>
                <Avatar
                  src={assignedMember.avatar}
                  name={assignedMember.name}
                  size="sm"
                  className="h-6 w-6"
                />
              </Tooltip>
            )}

            <TaskActionsDropdown
              task={task}
              onEdit={() => setIsDetailOpen(true)}
            />
          </div>
        </div>
      </motion.div>

      <TaskDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} task={task} />
    </>
  );
};

