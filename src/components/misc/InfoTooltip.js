import React, { useEffect } from "react";
import { renderToString } from "react-dom/server";
import imgSrc from "../../assets/icons/info.svg";
import styles from "./infotooltip.module.scss";
import ReactTooltip from "react-tooltip";

/**
 * Generic info tooltip
 * @method InfoTooltip
 */
const InfoTooltip = ({ text, setInfoTooltipContent, ...props }) => {
  const dataHtml = renderToString(text);
  useEffect(ReactTooltip.rebuild, []);
  return (
    <div
      className={styles.infoTooltip}
      data-for={"infoTooltip"}
      data-tip={dataHtml}
      data-html={true}
    >
      <img
        onMouseEnter={() => {
          setInfoTooltipContent(dataHtml);
        }}
        src={imgSrc}
      />
    </div>
  );
};

export default InfoTooltip;
