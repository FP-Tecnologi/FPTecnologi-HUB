import * as React from "react";
import { cn } from "@riteflow/lib/utils";

export interface InputProps {
  label?: string;
  type?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  placeholder,
}) => {
  // Use useId() for stable IDs that match between server and client
  const generatedId = React.useId();
  const inputId = name || `input-${generatedId}`;
  
  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-offWhite font-normal text-sm sm:text-base mb-2 sm:mb-3"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        className={cn(
          "h-[45px] w-full p-3 bg-linear-to-b from-slateBlue/20 to-royalBlue/20 border border-lineColor rounded-[10px] outline-none duration-300 focus:border-primary text-offWhite placeholder:text-offWhite/60",
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

Input.displayName = "Input";

export { Input };

