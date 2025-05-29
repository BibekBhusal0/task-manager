import React from "react";
import { Tooltip, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Task, ViewOptions } from "../types/task";
import { useTaskStore } from "../store/task-store";
import { motion } from "framer-motion";
import { TaskDetailModal } from "./task-detail-modal";
import { TaskActionsDropdown } from "./task-actions-dropdown";
import { PriorityChip } from "./priority-chip";
import { statusConfig } from "./status-chip";
import { DueDateChip } from "./due-date";
import { TagsChip } from "./tag-chips";

interface TaskListItemProps {
  task: Task;
  viewOptions: ViewOptions;
}

export const TaskListItem: React.FC<TaskListItemProps> = ({ task, viewOptions }) => {
  const { members } = useTaskStore();
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  // Find assigned member
  const assignedMember = task.assignedTo
    ? members.find((member) => member.id === task.assignedTo)
    : null;

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
                {viewOptions.showTags &&
                  <TagsChip tags={task.tags} />
                }

                {viewOptions.showPriority && (
                  <Tooltip content={`Priority: ${task.priority}`}>
                    <PriorityChip priority={task.priority} />
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {viewOptions.showDueDate && task.dueDate && <DueDateChip dueDate={task.dueDate} />}

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

            <TaskActionsDropdown task={task} onEdit={() => setIsDetailOpen(true)} />
          </div>
        </div>
      </motion.div>

      <TaskDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} task={task} />
    </>
  );
};
