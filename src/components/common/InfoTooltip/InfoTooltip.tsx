import { FC, ReactElement, useEffect } from "react";
import ReactTooltip from "react-tooltip";
import { renderToString } from "react-dom/server";
import classNames from "classnames";
import CSS from "csstype";

// local types
import { InfoTooltipContentSetter } from "../OptionControls/types";

// styles and assets
import styles from "./infotooltip.module.scss";
import imgSrc from "./info.svg";
import imgSrcWhite from "./info-white.svg";

interface InfoTooltipProps {
  /**
   * Unique ID of the tooltip.
   */
  id: string;

  /**
   * Content of tooltip as text or JSX.
   */
  text: string | ReactElement;

  /**
   * Optional: Function to set tooltip content. If undefined, tooltip will be
   * rendered inside component.
   */
  setInfoTooltipContent?: InfoTooltipContentSetter;

  /**
   * Optional: The side to open the tooltip on. If undefined, auto-positioned.
   */
  place?: "top" | "right" | "bottom" | "left";

  /**
   * True if the tooltip should be relatively wide, false for normal.
   */
  wide?: boolean;

  /**
   * Sets the default tooltip effect, either "float" (follows cursor) or
   * "solid" (immobile and position determined by target element). Note:
   * "solid" does not currently behave as expected.
   */
  effect?: "float" | "solid";

  /**
   * Optional: The size in pixels of the info tooltip icon. This sets the width
   * and height of the icon.
   */
  iconSize?: number;

  /**
   * Optional: Custom styles for the info tooltip image.
   */
  imgStyle?: CSS.Properties;

  /**
   * Optional: Custom styles for the info tooltip container.
   */
  style?: CSS.Properties;

  /**
   * Optional: If true, will be white, black otherwise. Defaults to false.
   */
  white?: boolean;
}

/**
 * Generic info tooltip.
 * @method InfoTooltip
 */
const InfoTooltip: FC<InfoTooltipProps> = ({
  id,
  text,
  setInfoTooltipContent,
  place = undefined,
  wide = false,
  effect = "float",
  iconSize = 10,
  imgStyle = {
    marginLeft: `${iconSize / 2}px`,
    height: `${iconSize}px`,
    width: `${iconSize}px`,
  },
  style = {},
  white = false,
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
        src={white ? imgSrcWhite : imgSrc}
        alt={"Info tooltip icon"}
        onMouseOver={() => {
          if (bindWithFunction && setInfoTooltipContent !== undefined) {
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
