import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface CustomDropdownProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  options: { label: string; value: string; disabled?: boolean }[];
  required?: boolean;
  disabled?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  value,
  onChange,
  placeholder = "Select...",
  options,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value && !o.disabled);

  const selectedLabel = selectedOption?.label ?? placeholder;


  // Calculate dropdown position + keep it synced on scroll
  useEffect(() => {
    if (!isOpen || !ref.current) return;

    const element = ref.current;

    const updatePosition = () => {
      const rect = element.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    };

    updatePosition();

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const getOptionClass = (
    opt: { value: string; disabled?: boolean },
    value?: string
  ) => {
    if (opt.disabled) {
      return "text-gray-400 cursor-not-allowed bg-gray-50";
    }

    if (opt.value === value) {
      return "bg-blue-500 text-white";
    }

    return "hover:bg-blue-100 cursor-pointer";
  };

  const portalRoot = document.getElementById("dropdown-portal");
  if (!portalRoot) return null;



  return (
    <div className="space-y-1 relative" ref={ref}>
      <label
        htmlFor="*"
        className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`border border-gray-300 rounded-lg p-2 text-sm cursor-pointer bg-white
          ${value ? "text-gray-900" : "text-gray-400"}`}
        onClick={() => setIsOpen((v) => !v)}
      >
        {selectedLabel}
      </div>

      {isOpen &&
        createPortal(
          <ul
            className="absolute bg-white border border-gray-300 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.06)] max-h-32 overflow-y-auto custom-scrollbar z-[9999]"
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
          >
            {options.map((opt) => (
              <li key={opt.value} role="none">
                <button
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    if (opt.disabled) return;
                    onChange?.(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm ${getOptionClass(opt, value)}`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>,
          portalRoot
        )}
    </div>
  );
};

export default CustomDropdown;