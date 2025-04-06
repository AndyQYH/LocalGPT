"use client";

import React, { forwardRef } from "react";

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, ...props }, ref) => {
    return (
      <button
        ref={ref}
        onClick={() => onCheckedChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
        {...props}
      >
        <span
          className={`absolute left-1 top-1 w-3 h-3 rounded-full bg-white transition ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
