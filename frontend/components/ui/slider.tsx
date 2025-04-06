"use client";

import React, { forwardRef } from "react";

export interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number[];
  onValueChange: (val: number[]) => void;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ min, max, step, value, onValueChange, ...props }, ref) => {
    return (
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([parseFloat(e.target.value)])}
        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
        {...props}
      />
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
