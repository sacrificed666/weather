import Link from "next/link";

import type { Locale } from "@/shared/i18n/locales";
import type { Translate } from "@/shared/i18n/translate";
import Icon from "@/shared/ui/Icon/Icon";
import type { IconName } from "@/shared/ui/Icon/icons";

import type { ForecastFailure } from "../../model/types";
import RetryButton from "../RetryButton/RetryButton";

import styles from "./ForecastError.module.scss";

export type ErrorKind = ForecastFailure | "unexpected";

const content = {
  "not-found": { icon: "search", title: "error.notFound.title", text: "error.notFound.text", retry: false },
  "missing-key": { icon: "alert", title: "error.missingKey.title", text: "error.missingKey.text", retry: true },
  "invalid-key": { icon: "alert", title: "error.invalidKey.title", text: "error.invalidKey.text", retry: true },
  "rate-limited": { icon: "clock", title: "error.rateLimited.title", text: "error.rateLimited.text", retry: true },
  unavailable: { icon: "offline", title: "error.unavailable.title", text: "error.unavailable.text", retry: true },
  unexpected: { icon: "alert", title: "error.unexpected.title", text: "error.unexpected.text", retry: true },
} as const satisfies Record<ErrorKind, { icon: IconName; title: string; text: string; retry: boolean }>;

interface ForecastErrorProps {
  kind: ErrorKind;
  t: Translate;
  home: `/${Locale}`;
  digest?: string;
  onRetry?: () => void;
}

// Why the forecast is missing, with a retry or a way home
const ForecastError = ({ kind, t, home, digest, onRetry }: ForecastErrorProps) => {
  const { icon, title, text, retry } = content[kind];
  return (
    <section className={styles.error} role="alert" aria-labelledby="forecast-error-title">
      <span className={styles.badge}>
        <Icon name={icon} size={28} />
      </span>
      <h1 className={styles.title} id="forecast-error-title">
        {t(title)}
      </h1>
      <p className={styles.text}>{t(text)}</p>
      {digest && <p className={styles.reference}>{t("error.reference", { digest })}</p>}
      <div className={styles.actions}>
        {retry && <RetryButton label={t("error.retry")} onRetry={onRetry} />}
        <Link className={styles.link} href={home}>
          {t("error.home")}
        </Link>
      </div>
    </section>
  );
};

export default ForecastError;
