import type { Sky as SkyName } from "../../model/conditions";

import styles from "./Sky.module.scss";

// The gradient sky behind the page for the current weather
const Sky = ({ sky }: { sky: SkyName }) => (
  <div className={styles.sky} data-sky={sky} aria-hidden="true">
    <span className={styles.glow} />
    <span className={styles.texture} />
  </div>
);

export default Sky;
