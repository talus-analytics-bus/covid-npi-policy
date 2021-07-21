import React, { useEffect } from "react";
import { renderToString } from "react-dom/server";
import imgSrc from "./info.svg";
import styles from "./infotooltip.module.scss";
import ReactTooltip from "react-tooltip";
import classNames from "classnames";

// TODO in TypeScript with docs.
/**
 * Generic info tooltip.
 * @method InfoTooltip
 */
const InfoTooltip = ({
  id,
  text,
  setInfoTooltipContent,
  place = undefined,
  wide = false,
  effect = "solid",
  iconSize = 10,
  imgStyle = {
    marginLeft: `${iconSize / 2}px`,
    height: `${iconSize}px`,
    width: `${iconSize}px`,
  },
  style = {},
}) => {
  // TODO try removing one or both rebuild calls
  // TODO document how `bindWithFunction` is used, try to streamline it
  useEffect(() => {
    ReactTooltip.rebuild();
  }, []);
  ReactTooltip.rebuild();

  // wrap text in HTML string that includes tooltip container
  const dataHtml = renderToString(
    <div className={styles.infoTooltipContainer} style={style}>
      {text}
    </div>
  );

  // bind w/ func if provided, otherwise return ReactTooltip component
  const bindWithFunction = setInfoTooltipContent !== undefined;
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
