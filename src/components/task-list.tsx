import React from "react";
import { Card, CardBody, } from "@heroui/react";
import { useTaskStore } from "../store/task-store";
import { TaskListItem } from "./task-list-item";
import { Task } from "../types/task";

interface TaskListProps {
  filteredTasks: Task[];
}

export const TaskList: React.FC<TaskListProps> = ({ filteredTasks }) => {
  const { viewOptions } = useTaskStore();

  return (
    <Card>
      <CardBody className="p-0">
        <div>
          {filteredTasks.map((task, index) => (
            <TaskListItem key={filteredTasks.length - index} task={task} viewOptions={viewOptions} />
          ))}
          {filteredTasks.length === 0 && (
            <div className="py-12 text-center text-default-400">No tasks match your filters</div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
