"use client";

import { useState, useRef } from "react";
import CreatableSelect from "react-select/creatable";

/* ================= TYPES ================= */

export type SelectOption = {
  label: string;
  value: string;
  [key: string]: any;
};

type Props = {
  value: SelectOption | null;
  onChange: (option: SelectOption | null) => void;
  onSearch: (search: string) => Promise<SelectOption[]>;

  placeholder?: string;
  label?: string;
  required?: boolean;
  errorMessage?: string;
  className?: string;
};

/* ================= COMPONENT ================= */

export default function SearchCreatableSelect({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  label,
  required,
  errorMessage,
  className = "",
}: Props) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const hasError = required && !value?.label?.trim();

  /* 🔥 search with debounce */
  const handleInputChange = (input: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!input) return;

      setLoading(true);
      const result = await onSearch(input);
      setOptions(result);
      setLoading(false);
    }, 400);

    return input;
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label (same as Input) */}
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <CreatableSelect<SelectOption, false>
        options={options}
        value={value}
        isLoading={loading}
        placeholder={placeholder}

        /* ❌ remove X button */
        isClearable={false}

        /* 🔥 search */
        onInputChange={handleInputChange}

        onChange={(option) => onChange(option ?? null)}

        onCreateOption={(inputValue) =>
          onChange({
            label: inputValue,
            value: inputValue,
          })
        }

        /* 🔥 make react-select look EXACTLY like your Input */
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: 20,
            borderRadius: 6,
            borderColor:
              hasError || errorMessage
                ? "#fca5a5"
                : state.isFocused
                ? "var(--brand-primary)"
                : "#d1d5db",
            backgroundColor:
              hasError || errorMessage ? "#fef2f2" : "#ffffff",
            boxShadow: state.isFocused
              ? "0 0 0 2px var(--brand-primary)"
              : "none",
            "&:hover": {
              borderColor: "var(--brand-primary)",
            },
            padding: 2,
            fontSize: "14px",
          }),

          valueContainer: (base) => ({
            ...base,
            padding: "4px 12px",
          }),

          input: (base) => ({
            ...base,
            margin: 0,
            padding: 0,
          }),

          indicatorsContainer: () => ({
            display: "none", // 🔥 removes dropdown arrow + clear icon
          }),

          menu: (base) => ({
            ...base,
            borderRadius: 2,
            overflow: "hidden",
            zIndex: 50,
          }),

          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? "#f3f4f6" : "white",
            color: "#111827",
            cursor: "pointer",
          }),
        }}
      />

      {/* Error (same as Input) */}
      {(hasError || errorMessage) && (
        <p className="text-xs md:text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-1">
          {errorMessage || "This field is required"}
        </p>
      )}
    </div>
  );
}
