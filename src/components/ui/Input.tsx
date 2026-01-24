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
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
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
  className = "",
}) => {
  const hasError = required && !value?.trim();

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <div className="relative">
        {/* Left Icon - Positioned consistently */}
        {leftIcon && (
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          {...register}
          onChange={(e) => {
            onChange?.(e);
            register?.onChange?.(e); // Ensure react-hook-form change still triggers
          }}
          className={`
            w-full rounded-md border transition-all duration-200
            focus:ring-2 focus:ring-[color:var(--brand-primary)] focus:border-[color:var(--brand-primary)] outline-none
            
            /* Responsive Text: 16px on mobile to prevent auto-zoom on iOS, 14px on desktop */
            text-base md:text-sm 
            
            /* Responsive Padding: Slightly larger vertical padding for easier tapping on mobile */
            py-2.5 md:py-1.5 
            
            ${leftIcon ? "pl-10" : "pl-4"}
            ${rightIcon ? "pr-10" : "pr-4"}
            ${
              hasError || errorMessage
                ? "border-red-300 bg-red-50 text-red-900 placeholder-red-300"
                : "border-gray-300 bg-white text-gray-900"
            }
          `}
        />

        {/* Right Icon */}
        {rightIcon && (
          <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none">
            {rightIcon}
          </span>
        )}
      </div>

      {(hasError || errorMessage) && (
        <p className="text-xs md:text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-1">
          {errorMessage || "This field is required"}
        </p>
      )}
    </div>
  );
};

export default Input;