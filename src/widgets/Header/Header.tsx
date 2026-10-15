import Link from "next/link";

import CitySearch from "@/features/places/ui/CitySearch/CitySearch";
import LocateButton from "@/features/places/ui/LocateButton/LocateButton";
import type { EffectsState, Preferences } from "@/features/settings/model/preferences";
import SettingsButton from "@/features/settings/ui/SettingsButton/SettingsButton";
import SettingsDialog from "@/features/settings/ui/SettingsDialog/SettingsDialog";
import { homeHref, type Locale } from "@/shared/i18n/locales";
import type { Translate } from "@/shared/i18n/translate";
import Logo from "@/shared/ui/Logo/Logo";

import styles from "./Header.module.scss";

interface HeaderProps {
  locale: Locale;
  preferences: Preferences;
  effects: EffectsState;
  t: Translate;
}

// Logo, city search, location and settings
const Header = ({ locale, preferences, effects, t }: HeaderProps) => (
  <header className={styles.header}>
    <div className={styles.bar}>
      <Link className={styles.brand} href={homeHref(locale)} aria-label={t("app.name")}>
        <Logo className={styles.logo} />
        <span className={styles.name}>{t("app.name")}</span>
      </Link>
      <CitySearch />
      <div className={styles.actions}>
        <LocateButton />
        <SettingsButton />
        <SettingsDialog preferences={preferences} deviceEffects={effects.device} />
      </div>
    </div>
  </header>
);

export default Header;
