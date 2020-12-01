import { Policy } from "../../../misc/Queries";

export const CATEGORY_FIELD_NAME = "primary_ph_measure";
export const SUBCATEGORY_FIELD_NAME = "ph_measure_details";

// recursively climb down through object according
// to an array of keys (the "path"), setting the lowest
// level of that object to the value, and creating any
// new nested objects needed to fulfill the path
const extendObjectByPath = ({ obj, path, valueObj }) => {
  if (path.length === 1) {
    obj[path[0]] = { ...obj[path[0]], ...valueObj };
  } else {
    obj[path[0]] = obj[path[0]] || {};
    extendObjectByPath({ obj: obj[path[0]], path: path.slice(1), valueObj });
  }
};

// Top-Level policy categories
export const loadPolicyCategories = async ({ filters, stateSetter }) => {
  console.log("loadPolicyCategories Called");
  const policyResponse = await Policy({
    method: "post",
    filters: filters,
    ordering: [["id", "desc"]],
    fields: ["id", CATEGORY_FIELD_NAME],
  });

  stateSetter(() => {
    const categories = {};
    policyResponse.data.forEach(policy => {
      extendObjectByPath({
        obj: categories,
        path: [policy[CATEGORY_FIELD_NAME]],
        valueObj: {},
      });
    });
    return categories;
  });

  // load subcategories synchronously;
  // this is probably worse for high-speed connections
  // compared to asynchronous loading but better for
  // low-speed connections. The delay isn't really
  // noticeable on high-speed connections so I'm
  // optimizing towards lower-speed connections here.
  loadPolicySubCategories({
    filters,
    stateSetter: stateSetter,
  });
};

// Load subcategories; this request should run
// immediately after the policy categories are loaded
const loadPolicySubCategories = async ({ filters, stateSetter }) => {
  console.log("loadPolicySubCategories Called");
  const policyResponse = await Policy({
    method: "post",
    filters: filters,
    ordering: [["id", "desc"]],
    fields: ["id", CATEGORY_FIELD_NAME, SUBCATEGORY_FIELD_NAME],
  });

  // functional format of useEffect is used so we can
  // update the object in-place, instead of re-creating
  // it every time
  stateSetter(prev => {
    policyResponse.data.forEach(policy => {
      extendObjectByPath({
        obj: prev,
        path: [policy[CATEGORY_FIELD_NAME], policy[SUBCATEGORY_FIELD_NAME]],
        valueObj: {},
      });
    });
    return { ...prev };
  });
};

// Loading descriptions should happen when the policy category is expanded
export const loadPolicyDescriptions = async ({ filters, stateSetter }) => {
  console.log("loadPolicyDescriptions Called");
  const policyResponse = await Policy({
    method: "post",
    filters: filters,
    ordering: [["id", "desc"]],
    fields: [
      "id",
      CATEGORY_FIELD_NAME,
      SUBCATEGORY_FIELD_NAME,
      "desc",
      "date_start_effective",
      "date_end_actual",
    ],
  });

  stateSetter(prev => {
    policyResponse.data.forEach(policy => {
      extendObjectByPath({
        obj: prev,
        path: [
          policy[CATEGORY_FIELD_NAME],
          policy[SUBCATEGORY_FIELD_NAME],
          `ID${policy.id}`,
        ],
        valueObj: {
          desc: policy.desc,
          date_start_effective: policy.date_start_effective,
          date_end_actual: policy.date_end_actual,
        },
      });
    });
    return { ...prev };
  });
};
