import React from "react";

import styles from "./ExpandingSection.module.scss";

const ExpandingSection = props => {
  const { open } = props;

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
        }
      : {
          height: 0,
          transition: `${animDuration}ms ease`,
          overflow: "hidden",
        }
  );

  // useLayoutEffect because the animation needs to know
  // the height of the children to set the target height
  // for the CSS animation
  React.useLayoutEffect(() => {
    let animTimer;

    // if the expander should be open but it isn't
    if (open && animationHiderStyle.height === 0) {
      clearTimeout(animTimer);
      setRenderChildren(true);
      setAnimationHiderStyle(prev => ({
        ...prev,
        height: contentContainer.current.getBoundingClientRect().height,
      }));

      // at the end of the animation, set the height
      // to auto so that it will adjust properly when
      // the window resizes
      animTimer = setTimeout(() => {
        setAnimationHiderStyle(prev => ({
          ...prev,
          height: "auto",
        }));
      }, animDuration);
    }

    // if the expander should be closed but it's open
    if (!open && animationHiderStyle.height === "auto") {
      clearTimeout(animTimer);

      // can't animate "auto" so set a height
      setAnimationHiderStyle(prev => ({
        ...prev,
        height: contentContainer.current.getBoundingClientRect().height,
      }));

      // set the height to 0 immediately after the
      // height is rendered into the DOM
      setTimeout(() => {
        setAnimationHiderStyle(prev => ({
          ...prev,
          height: 0,
        }));
      }, 0);

      // remove the children at the end of the animation
      animTimer = setTimeout(() => {
        setRenderChildren(false);
      }, animDuration);
    }
  }, [open, animationHiderStyle]);

  // handling the onOpen() and onClose() props
  const onClickHandler = e => {
    e.preventDefault();
    if (open) props.onClose && props.onClose();
    else props.onOpen && props.onOpen();
  };

  return (
    <div>
      <button className={styles.expanderButton} onClick={onClickHandler}>
        {children[0]}
      </button>
      <div style={animationHiderStyle}>
        <div ref={contentContainer}>
          {renderChildren &&
            (children.slice(1).length > 0 ? (
              children.slice(1)
            ) : (
              <p>Loading...</p>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ExpandingSection;
