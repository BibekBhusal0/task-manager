import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTaskStore } from "../store/task-store";
import { formatDistanceToNow } from "../utils/date-utils";
import { TaskDetailModal } from "./task-detail-modal";
import { Task } from "../types/task";

interface TaskTableProps {
  filteredTasks: Task[];
}

export const TaskTable: React.FC<TaskTableProps> = ({ filteredTasks }) => {
  const { viewOptions, members, updateTask, deleteTask } = useTaskStore();
  const [selectedTask, setSelectedTask] = React.useState<string | null>(null);

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

  const handleStatusChange = (taskId: string, status: string) => {
    updateTask(taskId, { status: status as any });
  };

  const handleDelete = (taskId: string) => {
    deleteTask(taskId);
  };

  const renderCell = (task: any, columnKey: string) => {
    const cellValue = task[columnKey];

    switch (columnKey) {
      case "title":
        return <div className="font-medium">{task.title}</div>;
      case "status":
        return (
          <Chip
            color={statusConfig[task.status].color as any}
            variant="flat"
            startContent={<Icon icon={statusConfig[task.status].icon} className="text-xs" />}
            size="sm"
          >
            {task.status.replace("-", " ")}
          </Chip>
        );
      case "tags":
        return (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag: string) => (
              <Chip key={tag} size="sm" variant="flat" className="text-xs">
                #{tag}
              </Chip>
            ))}
          </div>
        );
      case "assignedTo":
        const assignedMember = task.assignedTo
          ? members.find((member) => member.id === task.assignedTo)
          : null;
        return assignedMember ? (
          <div className="flex items-center gap-2">
            <Avatar
              src={assignedMember.avatar}
              name={assignedMember.name}
              size="sm"
              className="h-6 w-6"
            />
            <span className="text-sm">{assignedMember.name}</span>
          </div>
        ) : (
          <span className="text-sm text-default-400">Unassigned</span>
        );
      case "dueDate":
        return task.dueDate ? (
          <Chip
            size="sm"
            variant="flat"
            color={new Date(task.dueDate) < new Date() ? "danger" : "default"}
            startContent={<Icon icon="lucide:clock" className="text-xs" />}
          >
            {formatDistanceToNow(new Date(task.dueDate))}
          </Chip>
        ) : (
          <span className="text-sm text-default-400">No due date</span>
        );
      case "priority":
        return (
          <Chip size="sm" color={priorityColors[task.priority] as any} variant="dot">
            {task.priority}
          </Chip>
        );
      case "actions":
        return (
          <div className="flex justify-end">
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button isIconOnly variant="light" size="sm">
                  <Icon icon="lucide:more-horizontal" className="text-sm" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Task actions">
                <DropdownItem
                  key="edit"
                  startContent={<Icon icon="lucide:edit" className="text-sm" />}
                  onPress={() => setSelectedTask(task.id)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="todo"
                  startContent={<Icon icon="lucide:list-todo" className="text-sm" />}
                  onPress={() => handleStatusChange(task.id, "todo")}
                >
                  Move to To Do
                </DropdownItem>
                <DropdownItem
                  key="in-progress"
                  startContent={<Icon icon="lucide:loader" className="text-sm" />}
                  onPress={() => handleStatusChange(task.id, "in-progress")}
                >
                  Move to In Progress
                </DropdownItem>
                <DropdownItem
                  key="done"
                  startContent={<Icon icon="lucide:check" className="text-sm" />}
                  onPress={() => handleStatusChange(task.id, "done")}
                >
                  Move to Done
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  startContent={<Icon icon="lucide:trash" className="text-sm" />}
                  onPress={() => handleDelete(task.id)}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  };

  // Determine which columns to show based on view options
  const columns = [
    { key: "title", label: "TITLE" },
    { key: "status", label: "STATUS" },
    ...(viewOptions.showTags ? [{ key: "tags", label: "TAGS" }] : []),
    ...(viewOptions.showAssignee ? [{ key: "assignedTo", label: "ASSIGNED TO" }] : []),
    ...(viewOptions.showDueDate ? [{ key: "dueDate", label: "DUE DATE" }] : []),
    ...(viewOptions.showPriority ? [{ key: "priority", label: "PRIORITY" }] : []),
    { key: "actions", label: "" },
  ];

  // Find the selected task if any
  const taskToEdit = selectedTask ? filteredTasks.find((task) => task.id === selectedTask) : null;

  return (
    <>
      <Table
        aria-label="Tasks table"
        removeWrapper
        classNames={{
          base: "border border-divider rounded-medium overflow-hidden",
          th: "bg-default-50",
        }}
        onRowAction={(key: string) => setSelectedTask(key)}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} className={column.key === "actions" ? "text-right" : ""}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={filteredTasks} emptyContent="No tasks match your filters">
          {(task) => (
            <TableRow key={task.id}>
              {(columnKey) => <TableCell>{renderCell(task, columnKey as string)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {taskToEdit && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={taskToEdit}
        />
      )}
    </>
  );
};

