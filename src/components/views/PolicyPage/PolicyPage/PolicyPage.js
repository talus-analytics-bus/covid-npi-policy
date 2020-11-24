import React from "react";
import { useParams } from "react-router-dom";

const PolicyPage = props => {
  const { iso3, state, policyID } = useParams();

  return (
    <p>
      Specific PolicyPage {iso3} {state} {policyID}
    </p>
  );
};

export default PolicyPage;
