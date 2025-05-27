import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Avatar,
} from "@heroui/react";
import { useTaskStore } from "../store/task-store";
import { useSettingsStore } from "../store/settings-store";
import { getModalMotionProps } from "../utils/getModalMotionProps";

interface TeamMembersPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamMembersPanel: React.FC<TeamMembersPanelProps> = ({ isOpen, onClose }) => {
  const { members, selectMember } = useTaskStore();
  const { animationsEnabled } = useSettingsStore();

  const handleSelectMember = (member: any) => {
    selectMember(member);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      size="sm"
      motionProps={getModalMotionProps(animationsEnabled)}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Team Members</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-2">
                {members.map((member) => (
                  <Card
                    key={member.id}
                    isPressable
                    onPress={() => handleSelectMember(member)}
                    className="hover:bg-default-50"
                  >
                    <CardBody className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar src={member.avatar} name={member.name} className="h-10 w-10" />
                          <div
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${member.isOnline ? "bg-success" : "bg-default-300"}`}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-default-500">
                            {member.isOnline ? "Online" : "Offline"}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
