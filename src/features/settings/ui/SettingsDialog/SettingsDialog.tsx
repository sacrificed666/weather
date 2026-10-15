"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useOptimistic, useTransition } from "react";

import { LOCALE_COOKIE, LOCALE_INFO, LOCALES, switchLocale, type Locale } from "@/shared/i18n/locales";
import { useI18n } from "@/shared/i18n/useI18n";
import Flag from "@/shared/ui/Flag/Flag";
import Icon from "@/shared/ui/Icon/Icon";
import SegmentedControl from "@/shared/ui/SegmentedControl/SegmentedControl";

import { savePreference } from "../../model/actions";
import {
  themeColorFor,
  type Effects,
  type EffectsLevel,
  type PreferenceName,
  type Preferences,
  type Theme,
} from "../../model/preferences";
import { publishSaving } from "../../model/saving";
import { SETTINGS_DIALOG_ID } from "../ids";

import styles from "./SettingsDialog.module.scss";

const ONE_YEAR = 60 * 60 * 24 * 365;

// Applies a theme to the page and to the colour of the browser bar
const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.content = themeColorFor(theme, meta.media);
  }
};

// Remembers the language for the next visit to the bare address
const rememberLocale = (locale: Locale) => {
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax${secure}`;
};

interface SettingsDialogProps {
  preferences: Preferences;
  deviceEffects: EffectsLevel;
}

// Settings panel: appearance, units, effects and language
const SettingsDialog = ({ preferences, deviceEffects }: SettingsDialogProps) => {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
  const titleId = useId();
  const languagesId = useId();
  const [saving, startSaving] = useTransition();
  const [current, setCurrent] = useOptimistic(preferences, (state, change: Partial<Preferences>) => ({
    ...state,
    ...change,
  }));

  // The settings button spins while a choice is saved
  useEffect(() => {
    publishSaving(saving);
  }, [saving]);

  // Puts the page back to the saved theme and effects
  const restore = () => {
    applyTheme(preferences.theme);
    document.documentElement.dataset.effects = preferences.effects === "auto" ? deviceEffects : preferences.effects;
  };

  // Saves one choice; when that fails, for example offline, the saved one returns
  const update = <Name extends PreferenceName>(name: Name, value: Preferences[Name]) => {
    startSaving(async () => {
      setCurrent({ [name]: value });
      try {
        await savePreference(name, value);
      } catch {
        restore();
      }
    });
  };

  return (
    <dialog className={styles.panel} id={SETTINGS_DIALOG_ID} popover="auto" aria-labelledby={titleId}>
      <div className={styles.header}>
        <h2 className={styles.title} id={titleId}>
          {t("settings.title")}
        </h2>
        <button
          className={styles.close}
          type="button"
          popoverTarget={SETTINGS_DIALOG_ID}
          popoverTargetAction="hide"
          aria-label={t("settings.close")}
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      <SegmentedControl
        label={t("settings.theme")}
        name="theme"
        value={current.theme}
        onChange={(value) => {
          applyTheme(value);
          update("theme", value);
        }}
        options={[
          { value: "system", label: t("settings.theme.system"), icon: "auto" },
          { value: "light", label: t("settings.theme.light"), icon: "sun" },
          { value: "dark", label: t("settings.theme.dark"), icon: "moon" },
        ]}
      />

      <SegmentedControl
        label={t("settings.units")}
        name="units"
        value={current.units}
        onChange={(value) => update("units", value)}
        options={[
          { value: "metric", label: t("settings.units.metric") },
          { value: "imperial", label: t("settings.units.imperial") },
        ]}
      />

      <SegmentedControl
        label={t("settings.effects")}
        name="effects"
        value={current.effects}
        description={
          current.effects === "auto"
            ? t("settings.effects.device", { mode: t(`settings.effects.${deviceEffects}`) })
            : undefined
        }
        onChange={(value: Effects) => {
          document.documentElement.dataset.effects = value === "auto" ? deviceEffects : value;
          update("effects", value);
        }}
        options={[
          { value: "auto", label: t("settings.effects.auto") },
          { value: "full", label: t("settings.effects.full") },
          { value: "reduced", label: t("settings.effects.reduced") },
        ]}
      />

      <div className={styles.languages}>
        <h3 className={styles.legend} id={languagesId}>
          {t("settings.language")}
        </h3>
        <ul className={styles.grid} aria-labelledby={languagesId}>
          {LOCALES.map((entry) => (
            <li key={entry}>
              <a
                className={styles.language}
                href={`${switchLocale(pathname, entry)}${search}`}
                hrefLang={entry}
                lang={entry}
                aria-current={entry === locale ? "true" : undefined}
                onClick={() => rememberLocale(entry)}
              >
                <Flag country={LOCALE_INFO[entry].flag} height={14} />
                {LOCALE_INFO[entry].name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
};

export default SettingsDialog;
