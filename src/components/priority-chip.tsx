import React from "react";
import { Chip, Tooltip } from "@heroui/react";
import { TaskPriority } from "../types/task";

interface PriorityChipProps {
  priority: TaskPriority;
  disableTooltip?: boolean
}

export const priorityColors = {
  low: "success",
  medium: "warning",
  high: "danger",
};

export const PriorityChip: React.FC<PriorityChipProps> = ({ priority, disableTooltip = false }) => {
  return (
    <Tooltip content={`Priority: ${priority}`} isDisabled={disableTooltip}>
      <Chip size="sm" color={priorityColors[priority] as any} variant="dot">
        {priority}
      </Chip>
    </Tooltip>
  );
};
