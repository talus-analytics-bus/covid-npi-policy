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
      showCaret={true}
      open={expanderOpen}
      side={"right"}
      onOpen={() => setExpanderOpen(true)}
      onClose={() => setExpanderOpen(false)}
      containerStyle={{ borderRadius: "999px 5px 5px 5px" }}
    >
      <>{children[0]}</>
      <>{children.slice(1)}</>
    </ExpandingSection>
  );
};

export default NavDropDown;
