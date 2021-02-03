import React from "react";

import styles from "./ExpandingSection.module.scss";

const ExpandingSection = props => {
  const { open } = props;

  // store animTimer in a ref so that
  // canceling is reliable across render cycles
  const animTimer = React.useRef();

  let children = React.Children.toArray(props.children);

  // rendering children or not is differnet from the open and close status
  // of the expander because they need to render before the animation starts
  // to open and stop rendering only after the animation finishes closing
  const [renderChildren, setRenderChildren] = React.useState(open || false);

  // sets both the duration of the CSS animation and the JS cleanup
  // functions that need to run after the CSS animation is done
  const animDuration = 250;

  // ref for measuring the height of the content inside the section
  const contentContainer = React.useRef();

  // default state on component mount should match the open prop
  // so that the animation does not play when the component first
  // mounts either open or closed (like when it's opening or
  // closing as part of the scroll restoration process)
  const [animationHiderStyle, setAnimationHiderStyle] = React.useState(
    open
      ? {
          height: "auto",
          transition: `${animDuration}ms ease`,
          overflow: "hidden",
          ...(props.floating && {
            position: "absolute",
            ...props.positioning,
            zIndex: props.zIndex || 10,
            boxShadow: "0px 15px 30px -10px rgba(0, 0, 0, 0.25)",
          }),
        }
      : {
          height: 0,
          transition: `${animDuration}ms ease`,
          overflow: "hidden",
          ...(props.floating && {
            zIndex: props.zIndex || 10,
            position: "absolute",
            ...props.positioning,
            boxShadow: "0px 15px 30px -10px rgba(0, 0, 0, 0.25)",
          }),
        }
  );

  // useLayoutEffect because the animation needs to know
  // the height of the children to set the target height
  // for the CSS animation
  React.useLayoutEffect(() => {
    // if the expander should be open but it isn't
    if (open && animationHiderStyle.height === 0) {
      clearTimeout(animTimer.current);
      setRenderChildren(true);
      setAnimationHiderStyle(prev => ({
        ...prev,
        height: contentContainer.current.getBoundingClientRect().height,
      }));

      // at the end of the animation, set the height
      // to auto so that it will adjust properly when
      // the window resizes
      animTimer.current = setTimeout(() => {
        setAnimationHiderStyle(prev => ({
          ...prev,
          height: "auto",
        }));
      }, animDuration);
    }

    // if the expander should be closed but it's open
    if (!open && animationHiderStyle.height === "auto") {
      clearTimeout(animTimer.current);

      // using nested requestAnimationFrame here
      // so that react absolutely has to run them
      // in order.
      window.requestAnimationFrame(() => {
        // can't animate "auto" so set a height
        setAnimationHiderStyle(prev => ({
          ...prev,
          height: contentContainer.current.getBoundingClientRect().height,
        }));

        // set the height to 0 immediately after the
        // height is rendered into the DOM
        window.requestAnimationFrame(() => {
          setAnimationHiderStyle(prev => ({
            ...prev,
            height: 0,
          }));

          // remove the children at the end of the animation
          animTimer.current = setTimeout(() => {
            setRenderChildren(false);
          }, animDuration);
        });
      });
    }
  }, [open, animationHiderStyle]);

  // handling the onOpen() and onClose() props
  const onClickHandler = e => {
    e.preventDefault();
    if (!props.hover) {
      if (open) props.onClose && props.onClose();
      else props.onOpen && props.onOpen();
    }
  };

  const childElements = renderChildren && children.slice(1);

  // detect onBlur, set a no-time timer to close it next tick
  // but cancel the timer if one of the child elements got focus
  // taken from here:
  // https://reactjs.org/docs/accessibility.html#mouse-and-pointer-events

  let blurTimeout;

  const onBlurHandler = () => {
    if (props.floating) {
      blurTimeout = setTimeout(() => {
        props.onClose();
      });
    }
  };

  const onFocusHandler = () => {
    clearTimeout(blurTimeout);
    if (props.hover) {
      props.onOpen();
    }
  };

  const mouseEnterHandler = () => {
    if (props.hover) {
      props.onOpen();
    }
  };
  const mouseLeaveHandler = () => {
    if (props.hover) {
      props.onClose();
    }
  };

  return (
    <div
      onBlur={onBlurHandler}
      onFocus={onFocusHandler}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
    >
      <button className={styles.expanderButton} onClick={onClickHandler}>
        {children[0]}
      </button>
      <div style={animationHiderStyle}>
        <div ref={contentContainer}>{childElements}</div>
      </div>
    </div>
  );
};

export default ExpandingSection;
