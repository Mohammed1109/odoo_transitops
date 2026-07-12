import React, { useEffect, useState } from "react";

export interface FormLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  submitDisabled?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
}

const FormLayout: React.FC<FormLayoutProps> = ({
  title,
  description,
  children,
  onClose,
  onSubmit,
  isLoading = false,
  submitDisabled = false,
  size = "md",
}) => {
  /**
   * Width classes for the sliding panel.
   */
  const sizeClasses = {
    sm: "w-[45vw]",
    md: "w-[55vw]",
    lg: "w-[70vw]",
    xl: "w-[85vw]",
    xxl: "w-screen",
  };

  const [isVisible, setIsVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  /**
   * Show the panel after mount so the slide animation can run.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Prevent background page scrolling while the form is open.
   * This also helps dropdowns stay within the panel instead of
   * causing the entire page to scroll.
   */
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  /**
   * Close the panel with animation.
   */
  const handleClose = () => {
    setClosing(true);
    setResetKey((prev) => prev + 1);

    setTimeout(() => {
      onClose();
      setClosing(false);
    }, 300);
  };

  /**
   * Handle form submit.
   */
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div
      className={`
        fixed inset-0 z-50
        bg-black/50 backdrop-blur-sm
        overflow-hidden
        transition-opacity duration-300
        ${closing ? "opacity-0" : "opacity-100"}
      `}
    >
      {/* Right Side Sliding Panel */}
      <div
        className={`
          fixed top-0 right-0 h-screen
          bg-white shadow-2xl
          border-l border-gray-200
          flex flex-col
          overflow-hidden
          transition-transform duration-300 ease-in-out
          ${sizeClasses[size]}
          ${
            isVisible && !closing
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                {title}
              </h2>

              {description && (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="
                w-10 h-10
                rounded-lg
                flex items-center justify-center
                text-gray-500
                hover:bg-gray-100
                hover:text-gray-700
                transition-all
              "
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          key={resetKey}
          onSubmit={handleFormSubmit}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          {/* Scrollable Body */}
          <div
            className="
              flex-1
              min-h-0
              overflow-y-auto
              overflow-x-hidden
              custom-scrollbar
            "
          >
            <div className="p-4 space-y-6">
              {children}
            </div>
          </div>

          {/* Footer */}
          <div
            className="
              px-4 py-3
              border-t border-gray-100
              bg-gradient-to-r from-gray-50 to-white
              flex justify-end gap-3
              shrink-0
            "
          >
            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleClose}
              className="
                px-4 py-2.5
                bg-white
                border border-gray-300
                rounded-xl
                text-gray-700
                font-medium
                shadow-sm
                hover:bg-gray-50
                hover:border-gray-400
                hover:shadow-md
                active:scale-95
                transition-all duration-200
              "
            >
              Cancel
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || submitDisabled}
              className="
                px-4 py-2.5
                rounded-xl
                font-medium
                text-white
                bg-gradient-to-r from-blue-600 to-blue-700
                hover:from-blue-700 hover:to-blue-800
                shadow-sm
                hover:shadow-lg
                active:scale-95
                transition-all duration-200
                disabled:opacity-50
                disabled:cursor-not-allowed
                disabled:hover:shadow-none
                disabled:active:scale-100
              "
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Backdrop Click Area */}
      <div className="w-full h-full" onClick={handleClose} />
    </div>
  );
};

export default FormLayout;