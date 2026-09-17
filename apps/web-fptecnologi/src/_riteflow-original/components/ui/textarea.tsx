import * as React from "react";
import { cn } from "@riteflow/lib/utils";

export interface TextareaProps {
  label?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
}) => {
  // Use useId() for stable IDs that match between server and client
  const generatedId = React.useId();
  const textareaId = name || `textarea-${generatedId}`;
  
  return (
    <div>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-offWhite font-normal text-sm sm:text-base mb-2 sm:mb-3"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        className={cn(
          "h-[129px] w-full p-3 bg-linear-to-b from-slateBlue/20 to-royalBlue/20 border border-lineColor rounded-[10px] outline-none duration-300 focus:border-primary text-offWhite placeholder:text-offWhite/60",
          error && "border-red-500 focus:border-red-500"
        )}
        required
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

Textarea.displayName = "Textarea";

export { Textarea };

