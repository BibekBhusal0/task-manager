import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Switch, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useSettingsStore } from "../store/settings-store";
import { motion } from "framer-motion";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    theme, 
    toggleTheme, 
    animationsEnabled, 
    toggleAnimations,
    compactMode,
    toggleCompactMode
  } = useSettingsStore();
  
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
              Settings
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-default-500 text-sm">
                      {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                    </p>
                  </div>
                  <Switch
                    isSelected={theme === 'dark'}
                    onValueChange={toggleTheme}
                    startContent={<Icon icon="lucide:sun" />}
                    endContent={<Icon icon="lucide:moon" />}
                  />
                </div>
                
                <Divider />
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Animations</p>
                    <p className="text-default-500 text-sm">
                      Enable or disable animations
                    </p>
                  </div>
                  <Switch
                    isSelected={animationsEnabled}
                    onValueChange={toggleAnimations}
                  />
                </div>
                
                <Divider />
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Compact Mode</p>
                    <p className="text-default-500 text-sm">
                      Reduce spacing in the UI
                    </p>
                  </div>
                  <Switch
                    isSelected={compactMode}
                    onValueChange={toggleCompactMode}
                  />
                </div>
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