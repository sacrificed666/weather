import { cx } from "@/shared/lib/cx";

import styles from "./Skeleton.module.scss";

// A pulsing placeholder block
const Skeleton = ({ className }: { className?: string }) => <span className={cx(styles.skeleton, className)} />;

export default Skeleton;
