import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
} from "@heroui/react";
import { useTaskStore } from "../store/task-store";
import { TaskDetailModal } from "./task-detail-modal";
import { Task } from "../types/task";
import { TaskActionsDropdown } from "./task-actions-dropdown";
import { StatusChip } from "./status-chip";
import { PriorityChip } from "./priority-chip";
import { DueDateChip } from "./due-date";
import { TagsChip } from "./tag-chips";

interface TaskTableProps {
  filteredTasks: Task[];
}

export const TaskTable: React.FC<TaskTableProps> = ({ filteredTasks }) => {
  const { viewOptions, members } = useTaskStore();
  const [selectedTask, setSelectedTask] = React.useState<string | null>(null);

  const renderCell = (task: any, columnKey: string) => {
    const cellValue = task[columnKey];

    switch (columnKey) {
      case "title":
        return <div className="font-medium">{task.title}</div>;
      case "status":
        return <StatusChip status={task.status} />;
      case "tags":
        return <TagsChip tags={task.tags} />;
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
        return <DueDateChip dueDate={task.dueDate} />;
      case "priority":
        return <PriorityChip priority={task.priority} />;
      case "actions":
        return <TaskActionsDropdown onEdit={() => setSelectedTask(task.id)} task={task} />
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
      <Table aria-label="Tasks table" onRowAction={(key: string) => setSelectedTask(key)}>
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
