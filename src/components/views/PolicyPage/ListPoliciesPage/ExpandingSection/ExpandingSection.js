import React from "react";

import styles from "./ExpandingSection.module.scss";

const ExpandingSection = props => {
  const [renderChildren, setRenderChildren] = React.useState(false);

  let children = React.Children.toArray(props.children);

  const onClickHandler = e => {
    e.preventDefault();
    setRenderChildren(prev => !prev);
    props.onOpen && props.onOpen();
  };

  return (
    <div>
      <button className={styles.expanderButton} onClick={onClickHandler}>
        {children[0]}
      </button>
      {renderChildren &&
        (children.slice(1).length > 0 ? children.slice(1) : <p>Loading...</p>)}
    </div>
  );
};

export default ExpandingSection;
