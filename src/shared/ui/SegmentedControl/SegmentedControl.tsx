"use client";

import { useId } from "react";

import { cx } from "@/shared/lib/cx";

import Icon from "../Icon/Icon";
import type { IconName } from "../Icon/icons";

import styles from "./SegmentedControl.module.scss";

export interface SegmentedOption<Value extends string> {
  value: Value;
  label: string;
  icon?: IconName;
  title?: string;
}

interface SegmentedControlProps<Value extends string> {
  label: string;
  value: Value;
  options: readonly SegmentedOption<Value>[];
  onChange: (value: Value) => void;
  name?: string;
  description?: string;
  hideLabel?: boolean;
  className?: string;
}

// A native radio group styled as segments
const SegmentedControl = <Value extends string>({
  label,
  value,
  options,
  onChange,
  name,
  description,
  hideLabel = false,
  className,
}: SegmentedControlProps<Value>) => {
  const generatedName = useId();
  const descriptionId = useId();
  return (
    <fieldset className={cx(styles.control, className)} aria-describedby={description ? descriptionId : undefined}>
      <legend className={hideLabel ? "visually-hidden" : styles.legend}>{label}</legend>
      <div className={styles.track}>
        {options.map((option) => (
          <label key={option.value} className={styles.option} title={option.title}>
            <input
              className={styles.input}
              type="radio"
              name={name ?? generatedName}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            {option.icon ? <Icon name={option.icon} size={15} /> : null}
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {description ? (
        <p className={styles.description} id={descriptionId}>
          {description}
        </p>
      ) : null}
    </fieldset>
  );
};

export default SegmentedControl;
