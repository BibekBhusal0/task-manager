import React from "react";
import { Card, CardBody, CardFooter, Pagination, Divider } from "@heroui/react";
import { useTaskStore } from "../store/task-store";
import { TaskListItem } from "./task-list-item";
import { Task } from "../types/task";

interface TaskListProps {
  filteredTasks: Task[];
}

export const TaskList: React.FC<TaskListProps> = ({ filteredTasks }) => {
  const { viewOptions, itemsPerPage } = useTaskStore();

  const [page, setPage] = React.useState(1);

  const pages = Math.ceil(filteredTasks.length / itemsPerPage);
  const items = React.useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredTasks.slice(start, end);
  }, [page, filteredTasks, itemsPerPage]);

  React.useEffect(() => { setPage(1) }, [itemsPerPage])

  return (
    <Card>
      <CardBody className="p-0">
        <div>
          {items.map((task, index) => (
            <TaskListItem key={index} task={task} viewOptions={viewOptions} />
          ))}
          {filteredTasks.length === 0 && (
            <div className="py-12 text-center text-default-400">No tasks match your filters</div>
          )}
        </div>
      </CardBody>
          {pages !== 1 &&<Divider />}
      <CardFooter>
          {pages !== 1 &&<div className="flex w-full justify-center">
            <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={page}
            total={pages}
            onChange={(page) => setPage(page)}
          />
        </div>
        }
      </CardFooter>
    </Card>
  );
};
