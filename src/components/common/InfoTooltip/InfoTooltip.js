import React, { useEffect } from "react";
import { renderToString } from "react-dom/server";
import imgSrc from "./info.svg";
import styles from "./infotooltip.module.scss";
import ReactTooltip from "react-tooltip";
import classNames from "classnames";

/**
 * Generic info tooltip.
 * @method InfoTooltip
 */
const InfoTooltip = ({
  id,
  text,
  place = undefined,
  setInfoTooltipContent,
  wide = false,
  iconSize = 10,
  effect = "solid",
  style = {},
  imgStyle = {
    marginLeft: `${iconSize / 2}px`,
    height: `${iconSize}px`,
    width: `${iconSize}px`,
  },
}) => {
  const dataHtml = renderToString(
    <div className={styles.infoTooltipContainer} style={style}>
      {text}
    </div>
  );
  const bindWithFunction = setInfoTooltipContent !== undefined;
  useEffect(() => {
    ReactTooltip.rebuild();
  }, []);
  ReactTooltip.rebuild();
  return (
    <div
      className={classNames(styles.infoTooltip, { [styles.wide]: wide })}
      data-for={bindWithFunction ? "infoTooltip" : id}
      data-tip={dataHtml}
      data-class={wide ? styles.wide : ""}
      data-place={place ? place : undefined}
      data-html={true}
    >
      <img
        style={imgStyle}
        src={imgSrc}
        alt={"Info tooltip icon"}
        onMouseOver={() => {
          if (bindWithFunction) {
            setInfoTooltipContent(dataHtml);
          }
        }}
      />
      {// Info tooltip that is displayed whenever an info tooltip icon (i)
      // is hovered on in the site. The content for this tooltip is set by
      // `setInfoTooltipContent`.
      !bindWithFunction && (
        <ReactTooltip
          key={id}
          className={styles.infoTooltipContainer}
          type="light"
          delayHide={250}
          clickable={true}
          getContent={() => dataHtml}
          {...{ id, effect, place }}
        />
      )}
    </div>
  );
};

export default InfoTooltip;
