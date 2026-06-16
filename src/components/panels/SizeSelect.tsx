import React from 'react';

function buildOptions(min: number, max: number, step = 1): number[] {
  const out: number[] = [];
  for (let v = min; v <= max; v += step) out.push(v);
  return out;
}

function nearest(options: number[], value: number): number {
  return options.reduce((best, cur) => (Math.abs(cur - value) < Math.abs(best - value) ? cur : best), options[0]);
}

export const SizeSelect: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}> = ({ value, onChange, min, max, step = 1, suffix = 'px' }) => {
  const options = buildOptions(min, max, step);
  const selected = nearest(options, value);

  return (
    <select
      className="control-select"
      value={selected}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {options.map((v) => (
        <option key={v} value={v}>
          {v}
          {suffix}
        </option>
      ))}
    </select>
  );
};
