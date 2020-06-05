import React, { useEffect } from "react";
import { renderToString } from "react-dom/server";
import imgSrc from "./info.svg";
import styles from "./infotooltip.module.scss";
import ReactTooltip from "react-tooltip";

/**
 * Generic info tooltip
 * @method InfoTooltip
 */
const InfoTooltip = ({ id, text, ...props }) => {
  const dataHtml = renderToString(text);
  useEffect(ReactTooltip.rebuild, []);
  return (
    <div
      className={styles.infoTooltip}
      data-for={id}
      data-tip={dataHtml}
      data-html={true}
    >
      <img src={imgSrc} />
      {
        // Info tooltip that is displayed whenever an info tooltip icon (i)
        // is hovered on in the site. The content for this tooltip is set by
        // `setInfoTooltipContent`.
        <ReactTooltip
          id={id}
          key={id}
          className={styles.infoTooltipContainer}
          type="light"
          place="top"
          effect="float"
          delayHide={250}
          clickable={true}
          getContent={() => dataHtml}
        />
      }
    </div>
  );
};

export default InfoTooltip;
