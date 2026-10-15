import type { Translate } from "@/shared/i18n/translate";
import { SITE } from "@/shared/lib/site";
import { currentYear } from "@/shared/lib/time";
import ExternalLink from "@/shared/ui/ExternalLink/ExternalLink";

import styles from "./Footer.module.scss";

// Author, version, data source and source code
const Footer = ({ t }: { t: Translate }) => (
  <footer className={styles.footer}>
    <div className={styles.bar}>
      <p className={styles.owner}>
        © {currentYear()} {SITE.author.name}
        <span aria-hidden="true">·</span>
        <ExternalLink href={SITE.changelog} icon={false}>
          v{SITE.version}
        </ExternalLink>
      </p>
      <p className={styles.links}>
        <span>
          {t("footer.data")}:{" "}
          <ExternalLink href="https://openweathermap.org" icon={false}>
            OpenWeatherMap
          </ExternalLink>
        </span>
        <span>
          {t("footer.icons")}:{" "}
          <ExternalLink href="https://bas.dev/work/meteocons" icon={false}>
            Meteocons
          </ExternalLink>
        </span>
        <ExternalLink href={SITE.repository} icon={false}>
          {t("footer.source")}
        </ExternalLink>
      </p>
    </div>
  </footer>
);

export default Footer;
