import React from "react";

import styles from "./MiniMap.module.scss";

const MiniMap = props => (
  <div className={styles.container}>
    <div className={styles.placeholder}>
      <em>
        minimap <br /> placeholder
      </em>
    </div>
  </div>
);

export default MiniMap;
