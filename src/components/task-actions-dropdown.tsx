import React from "react";
import { useTaskStore } from "../store/task-store";
import { Task } from "../types/task";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface TaskActionsDropdownProps {
  task: Task,
  onEdit: () => void;
}

export const TaskActionsDropdown: React.FC<TaskActionsDropdownProps> = ({
  onEdit,
  task
}) => {
  const { deleteTask, changeStatus } = useTaskStore();

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
        <DropdownItem
          key="todo"
          startContent={<Icon icon="lucide:list-todo" className="text-sm" />}
          onPress={() => changeStatus(task.id, "todo")}
        >
          Move to To Do
        </DropdownItem>
        <DropdownItem
          key="in-progress"
          startContent={<Icon icon="lucide:loader" className="text-sm" />}
          onPress={() => changeStatus(task.id, "in-progress")}
        >
          Move to In Progress
        </DropdownItem>
        <DropdownItem
          key="done"
          startContent={<Icon icon="lucide:check" className="text-sm" />}
          onPress={() => changeStatus(task.id, "done")}
        >
          Move to Done
        </DropdownItem>
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
