import React, { type HTMLInputTypeAttribute, type ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface TextInputProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  errorMessage?: string;
  type?: HTMLInputTypeAttribute;
  maxLength?: number;
  register?: UseFormRegisterReturn;

  /** NEW */
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
  errorMessage,
  type = "text",
  maxLength,
  register,
  leftIcon,
  rightIcon,
}) => {
  const hasError = required && !value?.trim();

  return (
    <div className="space-y-1">
      {label&&<label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>}

      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            {leftIcon}
          </span>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          {...register}
          onChange={(e) => onChange?.(e)}
          className={`w-full rounded-sm px-4 py-1.5 border transition-colors
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${leftIcon ? "pl-10" : ""}
            ${rightIcon ? "pr-10" : ""}
            ${
              hasError || errorMessage
                ? "border-red-300 bg-red-50"
                : "border-gray-300"
            }
          `}
        />

        {/* Right Icon */}
        {rightIcon && (
          <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
            {rightIcon}
          </span>
        )}
      </div>

      {(hasError || errorMessage) && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};

export default Input;
