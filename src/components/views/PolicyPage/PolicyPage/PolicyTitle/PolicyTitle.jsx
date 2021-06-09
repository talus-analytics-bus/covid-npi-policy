import React from "react";
import removeParenthetical from "../../../../misc/UtilsTyped.tsx";

// TODO: replace with <FMT.Date> component
const formatDate = date => {
  if (!date) return undefined;
  return date.toLocaleString("en-us", {
    day: "numeric",
    month: "short",
    year: "numeric",
    // timeZone: "UTC",
  });
};

const PolicyTitle = ({ policy }) => (
  <h2>
    {policy ? (
      <>
        {`${removeParenthetical(policy.auth_entity[0].place.loc.split(",")[0])}
                      ${policy.primary_ph_measure}: `}
        <br />
        {policy.ph_measure_details}
        <br /> {policy && "issued "}
        {policy && formatDate(new Date(policy.date_start_effective))}
      </>
    ) : (
      <>
        <br />
        <br />
        <br />
      </>
    )}
  </h2>
);

export default PolicyTitle;
