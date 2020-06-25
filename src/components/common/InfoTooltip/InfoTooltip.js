import React, { useEffect } from "react";
import { renderToString } from "react-dom/server";
import imgSrc from "./info.svg";
import styles from "./infotooltip.module.scss";
import ReactTooltip from "react-tooltip";
import classNames from "classnames";

/**
 * Generic info tooltip
 * @method InfoTooltip
 */
const InfoTooltip = ({ id, text, place, ...props }) => {
  const dataHtml = renderToString(
    <div className={styles.infoTooltipContainer}>{text}</div>
  );
  const bindWithFunction = props.setInfoTooltipContent !== undefined;
  useEffect(ReactTooltip.rebuild, []);
  ReactTooltip.rebuild();
  return (
    <div
      className={classNames(styles.infoTooltip, { [styles.wide]: props.wide })}
      data-for={bindWithFunction ? "infoTooltip" : id}
      data-tip={dataHtml}
      data-class={props.wide ? styles.wide : ""}
      data-place={place ? place : undefined}
      data-html={true}
    >
      <img
        src={imgSrc}
        onMouseOver={() => {
          if (bindWithFunction) {
            props.setInfoTooltipContent(dataHtml);
          }
        }}
      />
      {// Info tooltip that is displayed whenever an info tooltip icon (i)
      // is hovered on in the site. The content for this tooltip is set by
      // `setInfoTooltipContent`.
      !bindWithFunction && (
        <ReactTooltip
          id={id}
          key={id}
          className={styles.infoTooltipContainer}
          type="light"
          effect="float"
          place="bottom"
          delayHide={250}
          clickable={true}
          getContent={() => dataHtml}
        />
      )}
    </div>
  );
};

export default InfoTooltip;
