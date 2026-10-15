"use client";

import { useI18n } from "@/shared/i18n/useI18n";
import IconButton from "@/shared/ui/IconButton/IconButton";

import { useSaving } from "../../model/saving";
import { SETTINGS_DIALOG_ID } from "../ids";

import styles from "./SettingsButton.module.scss";

// Opens the settings panel and spins while a setting is saved
const SettingsButton = () => {
  const { t } = useI18n();
  const saving = useSaving();
  return (
    <IconButton
      icon="sliders"
      label={t("settings.open")}
      popoverTarget={SETTINGS_DIALOG_ID}
      busy={saving}
      className={styles.button}
    />
  );
};

export default SettingsButton;
