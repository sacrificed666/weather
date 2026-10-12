import { type ReactNode, useId } from "react";

import { cx } from "@/shared/lib/cx";

import Icon from "../Icon/Icon";
import type { IconName } from "../Icon/icons";

import styles from "./Card.module.scss";

interface CardProps {
  title: string;
  icon: IconName;
  children: ReactNode;
  compact?: boolean;
  className?: string;
}

// A glass card with a labelled heading; compact for the small detail tiles
const Card = ({ title, icon, children, compact = false, className }: CardProps) => {
  const headingId = useId();
  return (
    <section className={cx(styles.card, compact && styles.compact, className)} aria-labelledby={headingId}>
      <h2 className={styles.title} id={headingId}>
        <Icon name={icon} size={15} />
        {title}
      </h2>
      {children}
    </section>
  );
};

export default Card;
