import React from "react";

import styles from "./ExpandMarker.module.scss";

const ExpandMarker = props => {
  const { open } = props;

  const hexString = props.arrowColor
    ? props.arrowColor.replace("#", "")
    : "FFFFFF";

  const circleStyle = {
    backgroundColor: props.backgroundColor || "#7fb0b4",
  };

  const [arrowStyle, setArrowStyle] = React.useState({
    transform: "scaleY(-1)",
    backgroundImage:
      `url("data:image/svg+xml,%3C%3Fxml ` +
      `version='1.0' encoding='utf-8'%3F%3E%3Csvg ` +
      `xmlns='http://www.w3.org/2000/svg' x='0px' y='0px' ` +
      `viewBox='0 0 36 18'%3E%3Cpath style='fill:%23${hexString};' ` +
      `d='M36,18H0L18,0L36,18z'/%3E%3C/svg%3E%0A")`,
  });

  React.useEffect(() => {
    if (open) {
      setArrowStyle(prev => ({
        ...prev,
        transform: "scaleY(1)",
      }));
    } else {
      setArrowStyle(prev => ({
        ...prev,
        transform: "scaleY(-1)",
      }));
    }
  }, [open]);

  return (
    <div className={styles.markerDot} style={circleStyle}>
      <div className={styles.arrow} style={arrowStyle} />
    </div>
  );
};

export default ExpandMarker;
