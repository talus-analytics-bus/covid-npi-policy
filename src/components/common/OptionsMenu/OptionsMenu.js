/**
 * Options menu that floats over a map field, or similar component, which
 * contains it.
 */

// standard packages
import React, { useState, useEffect, useRef } from "react";

// 3rd party packages
import classNames from "classnames";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";

// styles and assets
import styles, { wrapperWidth } from "./optionsmenu.module.scss";

// FUNCTION COMPONENT // ----------------------------------------------------//
/**
 * Map options menu that floats above the map field
 * @method OptionsMenu
 */
const OptionsMenu = ({
  // array of JSX components that make up the menu
  content,

  // true if in desktop mode the component should always be open, skinnier,
  // and not include the open/close button; false otherwise
  allowDesktop,

  // true if the open should be open by default in mobile mode, false otherwise
  defaultOpen = true,

  // true if menu should float on right side of screen, false if left side
  right = true,

  // if defined, function that returns text to show on toggle button
  toggleText = null,

  // additional properties, if any
  ...props
}) => {
  // CONSTANTS // -----------------------------------------------------------//
  // default chevron direction for open/close toggle button
  const useToggleText = typeof toggleText === "function";
  const chevron = right ? "chevron_right" : "chevron_left";

  // CSS styling attribute relevent for floating to one side of screen
  const sideKey = right ? "right" : "left";

  // STATE // ---------------------------------------------------------------//
  // reference to edge of component where toggle button is, to track width of
  // button to support open/close animation
  const edgeRef = useRef(null);

  // whether the mobile version of the menu is open by default
  const [open, setOpen] = useState(defaultOpen);
  const [openDesktop, setOpenDesktop] = useState(true);

  // dynamic styling for open/close sliding animation
  const [componentStyle, setComponentStyle] = useState({});
  const [wrapperStyle, setWrapperStyle] = useState({});

  // UTILITY FUNCTIONS // ---------------------------------------------------//
  const toggleOpen = () => {
    const buttonWidth = edgeRef.current.clientWidth.toString() + "px";
    if (open) {
      setComponentStyle({ [sideKey]: "-1px" });
    } else {
      setComponentStyle({ [sideKey]: "-" + wrapperWidth });
    }
  };

  // EFFECT HOOKS // --------------------------------------------------------//
  // when menu is opened or closed, dynamically set styles to enact open/close
  // animation (sliding)
  useEffect(() => {
    toggleOpen();
  }, [open]);

  // JSX // -----------------------------------------------------------------//
  return (
    <div
      className={classNames(styles.style, props.className, {
        [styles.float]: props.float === true,
        [styles.open]: open,
        [styles.right]: right,
        [styles.allowDesktop]: allowDesktop !== false,
      })}
      style={componentStyle}
    >
      {
        // wrapper containing menu content
      }
      <div
        style={wrapperStyle}
        className={classNames(styles.contentWrapper, {
          [styles.closed]: !open,
          [styles.closedDesktop]: !openDesktop,
        })}
      >
        <div className={styles.content}>
          {
            // content
          }
          {<PerfectScrollbar>{content}</PerfectScrollbar>}
        </div>
        <div
          className={classNames(styles.toggleDesktop, {
            [styles.closedDesktop]: !openDesktop,
          })}
        >
          <button onClick={() => setOpenDesktop(!openDesktop)}>
            {openDesktop ? "hide" : "show"} options{" "}
            <i
              className={classNames("material-icons", {
                [styles.flipped]: openDesktop,
              })}
            >
              play_arrow
            </i>
          </button>
        </div>
      </div>

      {
        // edge containing open / close button; non-desktop only
      }
      <div
        ref={edgeRef}
        onClick={() => {
          setOpen(!open);
        }}
        className={styles.edge}
      >
        <button
          className={classNames(styles.toggle, {
            [styles.flip]: !open,
            [styles.text]: useToggleText,
          })}
        >
          {useToggleText && <div>{toggleText(open)}</div>}
          {!useToggleText && <i className={"material-icons"}>{chevron}</i>}
        </button>
      </div>
    </div>
  );
};

export default OptionsMenu;
