import React from "react";

// This component needs to be moved
import ExpandingSection from "../../../views/PolicyPage/ListPoliciesPage/PolicyList/ExpandingSection/ExpandingSection";

const NavDropDown = props => {
  let children = React.Children.toArray(props.children);
  const [expanderOpen, setExpanderOpen] = React.useState();

  return (
    <ExpandingSection
      hover
      floating
      positioning={{ right: "24rem" }}
      open={expanderOpen}
      onOpen={() => setExpanderOpen(true)}
      onClose={() => setExpanderOpen(false)}
    >
      <>{children[0]}</>
      <>{children.slice(1)}</>
    </ExpandingSection>
  );
};

export default NavDropDown;
