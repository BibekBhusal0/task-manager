import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTaskStore } from "../store/task-store";
import { motion } from "framer-motion";
import { useSettingsStore } from "../store/settings-store";

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
      motionProps={animationsEnabled ? {
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
            },
          },
          exit: {
            y: 20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: [0.16, 1, 0.3, 1],
            },
          },
        },
        initial: { y: 20, opacity: 0 },
      } : undefined}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Team Members
            </ModalHeader>
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
                          <Avatar 
                            src={member.avatar} 
                            name={member.name} 
                            className="w-10 h-10"
                          />
                          <div 
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${member.isOnline ? 'bg-success' : 'bg-default-300'}`} 
                          />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-default-500 text-xs">
                            {member.isOnline ? 'Online' : 'Offline'}
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