import { extendObjectByPath, getObjectByPath } from "../objectPathTools";

const buildSummaryObject = data => {
  console.log("buildSummaryObject");

  const obj = {};
  data.forEach(policy => {
    extendObjectByPath({
      obj,
      path: [policy.date_start_effective, "enacted", policy.primary_ph_measure],
      valueObj: {
        [policy.id]: policy.id,
      },
    });
  });

  console.log(obj);
};

export default buildSummaryObject;
