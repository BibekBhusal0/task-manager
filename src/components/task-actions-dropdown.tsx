import React from "react";
import { useTaskStore } from "../store/task-store";
import { Task, TaskStatus } from "../types/task";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { statusConfig } from "./status-chip";

interface TaskActionsDropdownProps {
  task: Task;
  onEdit: () => void;
}

export const TaskActionsDropdown: React.FC<TaskActionsDropdownProps> = ({ onEdit, task }) => {
  const { deleteTask, changeStatus, } = useTaskStore();

  const handleDelete = () => {
    deleteTask(task.id);
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button isIconOnly variant="light" size="sm" className="text-default-400">
          <Icon icon="lucide:more-horizontal" className="text-sm" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Task actions">
        <DropdownItem
          key="edit"
          startContent={<Icon icon="lucide:edit" className="text-sm" />}
          onPress={onEdit}
        >
          Edit
        </DropdownItem>
        <>{Object.entries(statusConfig).map(([status, config]) => (
          <>{status !== task.status && <DropdownItem
            key={status}
            startContent={<Icon icon={config.icon} className="text-sm" />}
            onPress={() => changeStatus(task.id, status as TaskStatus)}
          >
            Move to {config.title}
          </DropdownItem> }</>
        ))}</>
        <DropdownItem
          key="delete"
          color="danger"
          startContent={<Icon icon="lucide:trash" className="text-sm" />}
          onPress={handleDelete}
        >
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

