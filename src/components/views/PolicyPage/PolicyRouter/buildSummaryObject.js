import { extendObjectByPath, getObjectByPath } from "../objectPathTools";

const fillDates = ({ obj, policy, type, start, stop }) => {
  for (let day = start; day <= stop; day.setDate(day.getDate() + 1)) {
    extendObjectByPath({
      obj,
      path: [
        day.toISOString().substring(0, 10),
        type,
        policy.primary_ph_measure,
      ],
      valueObj: {
        [policy.id]: policy.id,
      },
    });
  }
};

const buildSummaryObject = data => {
  // console.log("buildSummaryObject");
  // console.log(data);
  console.time("buildSummaryObject");

  const obj = {};
  data.forEach(policy => {
    // enacted
    extendObjectByPath({
      obj,
      path: [policy.date_start_effective, "enacted", policy.primary_ph_measure],
      valueObj: {
        [policy.id]: policy.id,
      },
    });

    // active
    fillDates({
      obj,
      policy,
      type: "active",
      start: new Date(policy.date_start_effective),
      stop: policy.date_end_actual
        ? new Date(policy.date_end_actual) <= new Date()
          ? new Date(policy.date_end_actual)
          : new Date()
        : new Date(),
    });

    // expired
    if (policy.date_end_actual)
      fillDates({
        obj,
        policy,
        type: "expired",
        start: new Date(policy.date_end_actual),
        stop: new Date(),
      });
  });

  console.timeEnd("buildSummaryObject");
  console.log(obj);
};

export default buildSummaryObject;
