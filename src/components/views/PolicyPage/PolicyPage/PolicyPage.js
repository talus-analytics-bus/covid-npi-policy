import React from "react";
import { useParams, useLocation } from "react-router-dom";

const PolicyPage = props => {
  const { iso3, state, policyID } = useParams();
  const location = useLocation();

  console.log(props);
  console.log(location);

  return (
    <p>
      Specific PolicyPage {iso3} {state} {policyID}
    </p>
  );
};

export default PolicyPage;
