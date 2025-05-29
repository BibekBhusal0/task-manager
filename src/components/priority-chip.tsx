import React from "react";
import { Chip, Tooltip } from "@heroui/react";
import { TaskPriority } from "../types/task";

interface PriorityChipProps {
  priority: TaskPriority;
}

const priorityColors = {
  low: "success",
  medium: "warning",
  high: "danger",
};

export const PriorityChip: React.FC<PriorityChipProps> = ({ priority }) => {
  return (
    <Tooltip content={`Priority: ${priority}`}>
      <Chip size="sm" color={priorityColors[priority] as any} variant="dot">
        {priority}
      </Chip>
    </Tooltip>
  );
};
