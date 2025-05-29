import { Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TaskStatus } from "../types/task";

type colors = "primary" | "danger" | "success" | "default" | "secondary" | "warning";
export type configType = {
  color: colors;
  icon: string;
  title: string;
};

export const statusConfig: Record<TaskStatus, configType> = {
  todo: { color: "default", icon: "lucide:list-todo", title: "To Do" },
  "in-progress": { color: "primary", icon: "lucide:loader", title: "In Progress" },
  done: { color: "success", icon: "lucide:check", title: "Done" },
};

export const StatusChip = ({ status }: { status: TaskStatus }) => {
  return (
    <Chip
      color={statusConfig[status].color as any}
      variant="flat"
      startContent={<Icon icon={statusConfig[status].icon} className="text-xs" />}
      size="sm"
    >
      {statusConfig[status].title}
    </Chip>
  );
};
