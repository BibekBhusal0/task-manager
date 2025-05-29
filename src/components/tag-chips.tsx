import React from "react";
import { Chip } from "@heroui/react";

interface TagsProps {
  tags: string[];
}

export const TagsChip: React.FC<TagsProps> = ({ tags }) => {
  return (
    <>
      {tags.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Chip key={tag} size="sm" variant="flat" className="text-xs">
              #{tag}
            </Chip>
          ))}
        </div>
      )}
    </>
  );
};
