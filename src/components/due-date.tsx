import {
  Chip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "../utils/date-utils";

export const DueDateChip = ({ dueDate }: { dueDate?: string | null }) => {
  return dueDate ? (
    <Chip
      size="sm"
      variant="flat"
      color={new Date(dueDate) < new Date() ? "danger" : "default"}
      startContent={<Icon icon="lucide:clock" className="text-xs" />}
    >
      {formatDistanceToNow(new Date(dueDate))}
    </Chip>
  ) : (
    <span className="text-sm text-default-400">No due date</span>
  );

};

