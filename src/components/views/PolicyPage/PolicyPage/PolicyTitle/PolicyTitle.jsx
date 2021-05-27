import React from "react";

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
        {`${policy.auth_entity[0].place.loc
          .split(",")[0]
          .replace(/\([A-Z]*\)/, "")}
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
