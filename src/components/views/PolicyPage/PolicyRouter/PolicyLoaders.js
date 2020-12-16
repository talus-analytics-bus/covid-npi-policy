import { Policy } from "../../../misc/Queries";
import { extendObjectByPath } from "../objectPathTools";

export const CATEGORY_FIELD_NAME = "primary_ph_measure";
export const SUBCATEGORY_FIELD_NAME = "ph_measure_details";

// Top-Level policy categories
export const loadPolicyCategories = async ({ filters, stateSetter }) => {
  console.log("loadPolicyCategories Called");
  const policyResponse = await Policy({
    method: "post",
    filters: filters,
    ordering: [["date_start_effective", "desc"]],
    fields: ["id", CATEGORY_FIELD_NAME],
  });

  // functional format of useEffect using previous value
  // so we can update the object in-place, instead of
  // re-creating it and losing the other categories
  // this makes it safe to run any of these loader
  // functions in any order, improving responsiveness

  const policyCounts = {};

  stateSetter(prev => {
    policyResponse.data.forEach(policy => {
      if (policyCounts[policy[CATEGORY_FIELD_NAME]])
        policyCounts[policy[CATEGORY_FIELD_NAME]].count += 1;
      else policyCounts[policy[CATEGORY_FIELD_NAME]] = { count: 1 };

      extendObjectByPath({
        obj: prev,
        path: [policy[CATEGORY_FIELD_NAME]],
        valueObj: {
          children: prev[policy[CATEGORY_FIELD_NAME]]
            ? prev[policy[CATEGORY_FIELD_NAME]].children
            : {},
          count: policyCounts[policy[CATEGORY_FIELD_NAME]].count,
        },
      });
    });

    // spread operator to create a shallow
    // copy which will trigger re-render
    return { ...prev };
  });
  console.log("loadPolicyCategories Done");

  // calling loadPolicySubCategories here would
  // load subcategories synchronously; this is
  // probably worse for high-speed connections
  // compared to asynchronous loading but better
  // for low-speed connections.

  // Testing with live API server I found most of the
  // delay was TTFB, not download time, so I switched
  // back to running these asynchronously.
};

// Load subcategories; this request should run
// immediately after the policy categories are loaded
export const loadPolicySubCategories = async ({ filters, stateSetter }) => {
  console.log("loadPolicySubCategories Called");
  const policyResponse = await Policy({
    method: "post",
    filters: filters,
    ordering: [["date_start_effective", "desc"]],
    fields: ["id", CATEGORY_FIELD_NAME, SUBCATEGORY_FIELD_NAME],
  });

  // intentionally re-creating the object from scratch here in case
  // the categories have not yet been loaded, so that getting categories
  // and getting subcategories can safely be asynchronous
  // With more efficient API endpoints I think this request
  // will probably totally replace the loadPoliciesCategories request.
  const policyCounts = {};

  stateSetter(prev => {
    // const categoriesAndSubcategories = {};
    policyResponse.data.forEach(policy => {
      if (policyCounts[policy[CATEGORY_FIELD_NAME]])
        policyCounts[policy[CATEGORY_FIELD_NAME]][
          policy[SUBCATEGORY_FIELD_NAME]
        ] =
          policyCounts[policy[CATEGORY_FIELD_NAME]][
            policy[SUBCATEGORY_FIELD_NAME]
          ] + 1 || 1;
      else
        policyCounts[policy[CATEGORY_FIELD_NAME]] = {
          [policy[SUBCATEGORY_FIELD_NAME]]: 1,
        };

      extendObjectByPath({
        obj: prev,
        path: [
          policy[CATEGORY_FIELD_NAME],
          "children",
          policy[SUBCATEGORY_FIELD_NAME],
        ],
        valueObj: {
          children: {},
          count:
            policyCounts[policy[CATEGORY_FIELD_NAME]][
              policy[SUBCATEGORY_FIELD_NAME]
            ],
        },
      });
    });

    return { ...prev };
  });
  console.log("loadPolicySubCategories Done");
};

// Loading descriptions should happen when the policy category is expanded
// This function will also create any needed subcategories as it goes, so
// that it can short-cut the loadPolicySubCategories request if the user
// selects a category before all subcategories are loaded.
export const loadPolicyDescriptions = async ({ filters, stateSetter }) => {
  console.log("loadPolicyDescriptions Called");
  const policyResponse = await Policy({
    method: "post",
    filters: filters,
    ordering: [["date_start_effective", "desc"]],
    fields: [
      "id",
      CATEGORY_FIELD_NAME,
      SUBCATEGORY_FIELD_NAME,
      "desc",
      "policy_name",
      "date_start_effective",
      "date_end_actual",
      "subtarget",
    ],
  });

  stateSetter(prev => {
    policyResponse.data.forEach(policy => {
      extendObjectByPath({
        obj: prev,
        path: [
          policy[CATEGORY_FIELD_NAME],
          "children",
          policy[SUBCATEGORY_FIELD_NAME],
          "children",
          `ID${policy.id}`,
        ],
        valueObj: {
          desc: policy.desc,
          date_start_effective: policy.date_start_effective,
          date_end_actual: policy.date_end_actual,
          subtarget: policy.subtarget,
          policy_name: policy.policy_name,
          [CATEGORY_FIELD_NAME]: policy[CATEGORY_FIELD_NAME],
          [SUBCATEGORY_FIELD_NAME]: policy[SUBCATEGORY_FIELD_NAME],
        },
      });
    });

    return { ...prev };
  });
  console.log("loadPolicyDescriptions Done");
};

export const loadFullPolicy = async ({ filters, stateSetter }) => {
  const policyResponse = await Policy({
    method: "post",
    filters: filters,
    ordering: [["date_start_effective", "desc"]],
    fields: [
      "id",
      CATEGORY_FIELD_NAME,
      SUBCATEGORY_FIELD_NAME,
      "desc",
      "policy_name",
      "date_start_effective",
      "date_end_actual",
      "subtarget",
      "auth_entity",
    ],
  });

  stateSetter(prev => {
    policyResponse.data.forEach(policy => {
      extendObjectByPath({
        obj: prev,
        path: [
          policy[CATEGORY_FIELD_NAME],
          "children",
          policy[SUBCATEGORY_FIELD_NAME],
          "children",
          `ID${policy.id}`,
        ],
        valueObj: {
          desc: policy.desc,
          date_start_effective: policy.date_start_effective,
          date_end_actual: policy.date_end_actual,
          policy_name: policy.policy_name,
          [CATEGORY_FIELD_NAME]: policy[CATEGORY_FIELD_NAME],
          [SUBCATEGORY_FIELD_NAME]: policy[SUBCATEGORY_FIELD_NAME],
          subtarget: policy.subtarget,
          auth_entity: policy.auth_entity,
        },
      });
    });

    return { ...prev };
  });
};
