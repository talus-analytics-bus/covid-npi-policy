import { Policy } from "../../../misc/Queries";
import { extendObjectByPath, getObjectByPath } from "../objectPathTools";

export const CATEGORY_FIELD_NAME = "primary_ph_measure";
export const SUBCATEGORY_FIELD_NAME = "ph_measure_details";

const checkPolicyActive = policy =>
  policy.date_end_actual ? new Date(policy.date_end_actual) > new Date() : true;

// Top-Level policy categories
export const loadPolicyCategories = async ({
  filters,
  stateSetter,
  setStatus,
  sort,
  summarySetter = false,
}) => {
  console.log("loadPolicyCategories Called");
  const policyResponse = await Policy({
    method: "post",
    filters: filters,
    ordering: [["date_start_effective", sort]],
    fields: ["id", CATEGORY_FIELD_NAME, "date_end_actual"],
  });

  // functional format of useEffect using previous value
  // so we can update the object in-place, instead of
  // re-creating it and losing the other categories
  // this makes it safe to run any of these loader
  // functions in any order, improving responsiveness

  if (policyResponse.n === 0) {
    setStatus(prev => ({ ...prev, policies: "error" }));
  } else {
    setStatus(prev => ({
      ...prev,
      policies: "loaded",
      policiesSummary: "loaded",
    }));

    const buildObject = (prev, data) => {
      data.forEach(policy => {
        const active = checkPolicyActive(policy) ? 1 : 0;

        extendObjectByPath({
          obj: prev,
          path: [policy[CATEGORY_FIELD_NAME]],
          valueObj: {
            count:
              getObjectByPath({
                obj: prev,
                path: [policy[CATEGORY_FIELD_NAME], "count"],
              }) + 1 || 1,
            active:
              getObjectByPath({
                obj: prev,
                path: [policy[CATEGORY_FIELD_NAME], "active"],
              }) + active || active,
          },
        });

        extendObjectByPath({
          obj: prev,
          path: [policy[CATEGORY_FIELD_NAME]],
          valueObj: {
            children: prev[policy[CATEGORY_FIELD_NAME]]
              ? prev[policy[CATEGORY_FIELD_NAME]].children
              : {},
          },
        });
      });
      // spread operator to create a shallow
      // copy which will trigger re-render
      return { ...prev };
    };

    if (summarySetter) {
      summarySetter(prev => buildObject(prev, policyResponse.data));
    }

    // this duplication means that the policies are fully
    // parsed twice on page load... because I can't guarantee
    // that this request will finish before the subcategories
    // request, so it has to merge with the policyObject.
    stateSetter(prev => buildObject(prev, policyResponse.data));
  }
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
export const loadPolicySubCategories = async ({
  filters,
  stateSetter,
  setStatus,
  sort,
}) => {
  console.log("loadPolicySubCategories Called");
  const policyResponse = await Policy({
    method: "post",
    filters: filters,
    ordering: [["date_start_effective", sort]],
    fields: [
      "id",
      "auth_entity",
      CATEGORY_FIELD_NAME,
      SUBCATEGORY_FIELD_NAME,
      "date_end_actual",
    ],
  });

  // intentionally re-creating the object from scratch here in case
  // the categories have not yet been loaded, so that getting categories
  // and getting subcategories can safely be asynchronous
  // With more efficient API endpoints I think this request
  // will probably totally replace the loadPoliciesCategories request.

  if (policyResponse.n === 0) {
    setStatus(prev => ({ ...prev, policies: "error" }));
  } else {
    setStatus(prev => ({ ...prev, policies: "loaded" }));

    stateSetter(prev => {
      policyResponse.data.forEach(policy => {
        let path = [
          policy[CATEGORY_FIELD_NAME],
          "children",
          policy.auth_entity[0].place.level,
          "children",
          policy[SUBCATEGORY_FIELD_NAME],
        ];

        const place = policy.auth_entity[0].place;

        if (
          (filters.iso3[0] === "USA" && place.level === "Local") ||
          (filters.iso3[0] !== "USA" && place.level === "State / Province")
        ) {
          path = [
            ...path,
            "children",
            policy.auth_entity[0].place.loc.split(",")[0],
          ];
        }

        const active = checkPolicyActive(policy) ? 1 : 0;

        // generate counts only for levels past the top level
        // since the top level is counted by the other loader
        path.forEach((step, index) => {
          if (index !== 0 && step !== "children") {
            const stepPath = [...path.slice(0, index + 1)];
            extendObjectByPath({
              obj: prev,
              path: stepPath,
              valueObj: {
                count:
                  getObjectByPath({ obj: prev, path: [...stepPath, "count"] }) +
                    1 || 1,
                active:
                  getObjectByPath({
                    obj: prev,
                    path: [...stepPath, "active"],
                  }) + active || active,
              },
            });
          }
        });

        extendObjectByPath({
          obj: prev,
          path: path,
          valueObj: {
            children: {},
          },
        });
      });

      return { ...prev };
    });
  }
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
      "auth_entity",
    ],
  });

  stateSetter(prev => {
    policyResponse.data.forEach(policy => {
      let path = [
        policy[CATEGORY_FIELD_NAME],
        "children",
        policy.auth_entity[0].place.level,
        "children",
        policy[SUBCATEGORY_FIELD_NAME],
      ];

      const place = policy.auth_entity[0].place;

      if (
        (filters.iso3[0] === "USA" && place.level === "Local") ||
        (filters.iso3[0] !== "USA" && place.level === "State / Province")
      ) {
        path = [
          ...path,
          "children",
          policy.auth_entity[0].place.loc.split(",")[0],
        ];
      }

      path = [...path, "children", `ID${policy.id}`];

      extendObjectByPath({
        obj: prev,
        path: path,
        valueObj: {
          desc: policy.desc,
          date_start_effective: policy.date_start_effective,
          date_end_actual: policy.date_end_actual,
          policy_name: policy.policy_name,
          [CATEGORY_FIELD_NAME]: policy[CATEGORY_FIELD_NAME],
          [SUBCATEGORY_FIELD_NAME]: policy[SUBCATEGORY_FIELD_NAME],
          auth_entity: policy.auth_entity,
        },
      });
    });

    return { ...prev };
  });
  console.log("loadPolicyDescriptions Done");
};

export const loadFullPolicy = async ({ filters, stateSetter }) => {
  // debugger;
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

  // filters = { iso3: ["USA"] };

  stateSetter(prev => {
    policyResponse.data.forEach(policy => {
      let path = [
        policy[CATEGORY_FIELD_NAME],
        "children",
        policy.auth_entity[0].place.level,
        "children",
        policy[SUBCATEGORY_FIELD_NAME],
      ];

      const place = policy.auth_entity[0].place;

      if (
        (filters.iso3[0] === "USA" && place.level === "Local") ||
        (filters.iso3[0] !== "USA" && place.level === "State / Province")
      ) {
        path = [
          ...path,
          "children",
          policy.auth_entity[0].place.loc.split(",")[0],
        ];
      }

      path = [...path, "children", `ID${policy.id}`];

      extendObjectByPath({
        obj: prev,
        path: path,
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
