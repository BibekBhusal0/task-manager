import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Switch,
} from "@heroui/react";
import { useTaskStore } from "../store/task-store";

interface ViewOptionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ViewOptions: React.FC<ViewOptionsProps> = ({ isOpen, onClose }) => {
  const { viewOptions, updateViewOptions } = useTaskStore();

  const [localOptions, setLocalOptions] = React.useState(viewOptions);

  // Reset local options when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalOptions(viewOptions);
    }
  }, [isOpen, viewOptions]);

  const handleToggleOption = (option: keyof typeof localOptions) => {
    setLocalOptions({
      ...localOptions,
      [option]: !localOptions[option],
    });
  };

  const handleSave = () => {
    updateViewOptions(localOptions);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      size="sm"
    // motionProps={
    //   animationsEnabled
    //     ? {
    //         variants: {
    //           enter: {
    //             y: 0,
    //             opacity: 1,
    //             transition: {
    //               duration: 0.3,
    //               ease: [0.16, 1, 0.3, 1],
    //             },
    //           },
    //           exit: {
    //             y: 20,
    //             opacity: 0,
    //             transition: {
    //               duration: 0.2,
    //               ease: [0.16, 1, 0.3, 1],
    //             },
    //           },
    //         },
    //         initial: { y: 20, opacity: 0 },
    //       }
    //     : undefined
    // }
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">View Options</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Tags</p>
                    <p className="text-sm text-default-500">Display task tags</p>
                  </div>
                  <Switch
                    isSelected={localOptions.showTags}
                    onValueChange={() => handleToggleOption("showTags")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Assignee</p>
                    <p className="text-sm text-default-500">Display assigned team member</p>
                  </div>
                  <Switch
                    isSelected={localOptions.showAssignee}
                    onValueChange={() => handleToggleOption("showAssignee")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Due Date</p>
                    <p className="text-sm text-default-500">Display task due date</p>
                  </div>
                  <Switch
                    isSelected={localOptions.showDueDate}
                    onValueChange={() => handleToggleOption("showDueDate")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Priority</p>
                    <p className="text-sm text-default-500">Display task priority</p>
                  </div>
                  <Switch
                    isSelected={localOptions.showPriority}
                    onValueChange={() => handleToggleOption("showPriority")}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSave}>
                Apply
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
