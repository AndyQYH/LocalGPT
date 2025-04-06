"use client";

import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface Params {
  temperature: number;
  maxTokens: number;
  topK: number;
  topP: number;
  lengthPenalty: number;
  repetitionPenalty: number;
}

interface ParameterTuningMenuProps {
  onParamsChange: (params: Params) => void;
}

const ParameterTuningMenu: React.FC<ParameterTuningMenuProps> = ({ onParamsChange }) => {
  const [temperature, setTemperature] = useState(0.5);
  const [maxTokens, setMaxTokens] = useState(500);
  const [topK, setTopK] = useState(3);
  const [topP, setTopP] = useState(0.3);
  const [lengthPenalty, setLengthPenalty] = useState(-1);
  const [repetitionPenalty, setRepetitionPenalty] = useState(1);
  const [enabled, setEnabled] = useState(true);

  const handleApply = () => {
    onParamsChange({
      temperature,
      maxTokens,
      topK,
      topP,
      lengthPenalty,
      repetitionPenalty,
    });
  };

  return (
    <div className="w-80 bg-muted p-4 shadow-lg border-l border-gray-200">
      <h3 className="text-lg font-medium mb-4">Parameter Tuning</h3>
      <div className="flex items-center justify-between mb-3">
        <span>Enable Custom Tuning</span>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>
      <Separator className="my-2" />
      {enabled && (
        <>
          {[ 
            { label: "Temperature", value: temperature, setter: setTemperature, min: 0, max: 1, step: 0.1 },
            { label: "Max Tokens", value: maxTokens, setter: setMaxTokens, min: 50, max: 2048, step: 50 },
            { label: "Top K", value: topK, setter: setTopK, min: 0, max: 100, step: 5 },
            { label: "Top P", value: topP, setter: setTopP, min: 0, max: 1, step: 0.1 },
            { label: "Length Penalty", value: lengthPenalty, setter: setLengthPenalty, min: -20, max: 20, step: 0.1 },
            { label: "Repetition Penalty", value: repetitionPenalty, setter: setRepetitionPenalty, min: 1, max: 2, step: 0.1 },
          ].map(({ label, value, setter, min, max, step }) => (
            <div className="mb-4" key={label}>
              <label className="text-sm font-medium">{`${label} (${value})`}</label>
              <Slider min={min} max={max} step={step} value={[value]} onValueChange={(val:any) => setter(val[0])} />
            </div>
          ))}
          <Button onClick={handleApply} className="w-full mt-2 bg-primary text-white">
            Apply Settings
          </Button>
        </>
      )}
    </div>
  );
};

export default ParameterTuningMenu;
