import React from "react";
import { useParams } from "react-router-dom";

const PolicyPage = props => {
  const { iso3, state } = useParams();

  return (
    <p>
      List PolicyPage {iso3} {state}
    </p>
  );
};

export default PolicyPage;
