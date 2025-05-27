import { HTMLMotionProps } from "framer-motion";

export function getModalMotionProps(animationEnabled: boolean): HTMLMotionProps<"section"> {
  return animationEnabled
    ? {
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
      }
    }
    : { variants: { enter: { transition: { duration: 0 } }, exit: { transition: { duration: 0 } } } }
} 
