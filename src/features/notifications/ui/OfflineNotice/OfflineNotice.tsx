"use client";

import { useOffline } from "next/offline";

import { useI18n } from "@/shared/i18n/useI18n";
import Icon from "@/shared/ui/Icon/Icon";

import styles from "./OfflineNotice.module.scss";

// Shown while offline: the forecast updates once the connection is back
const OfflineNotice = () => {
  const { t } = useI18n();
  const offline = useOffline();
  return (
    <output className={styles.region}>
      {offline ? (
        <span className={styles.notice}>
          <Icon name="offline" size={18} />
          {t("offline.message")}
        </span>
      ) : null}
    </output>
  );
};

export default OfflineNotice;
