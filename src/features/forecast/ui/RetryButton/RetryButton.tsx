"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { cx } from "@/shared/lib/cx";
import Icon from "@/shared/ui/Icon/Icon";

import styles from "./RetryButton.module.scss";

interface RetryButtonProps {
  label: string;
  onRetry?: () => void;
}

// Reloads the forecast and shows that it is busy
const RetryButton = ({ label, onRetry }: RetryButtonProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      className={styles.button}
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => (onRetry ? onRetry() : router.refresh()))}
    >
      <Icon name={pending ? "loader" : "refresh"} size={18} className={cx(pending && styles.spinning)} />
      {label}
    </button>
  );
};

export default RetryButton;
