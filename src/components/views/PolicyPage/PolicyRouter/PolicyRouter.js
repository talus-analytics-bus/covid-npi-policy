import React from "react";
import { useParams } from "react-router-dom";

import { Policy, Caseload } from "../../../misc/Queries";

import * as MiniMap from "../MiniMap/MiniMap";

import PolicyPage from "../PolicyPage/PolicyPage";
import ListPoliciesPage from "../ListPoliciesPage/ListPoliciesPage";

export const CATEGORY_FIELD_NAME = "primary_ph_measure";
export const SUBCATEGORY_FIELD_NAME = "ph_measure_details";

// recursively climb down through object according
// to an array of keys (the "path"), setting the lowest
// level of that object to the value, and creating any
// new nested objects needed to fulfill the path
export const extendObjectByPath = ({ obj, path, valueObj }) => {
  if (path.length === 1) {
    obj[path[0]] = { ...obj[path[0]], ...valueObj };
  } else {
    obj[path[0]] = obj[path[0]] || {};
    extendObjectByPath({ obj: obj[path[0]], path: path.slice(1), valueObj });
  }
};

const loadPolicyCategories = async ({ filters, stateSetter }) => {
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

  loadPolicySubCategories({
    filters,
    stateSetter: stateSetter,
  });
};

const loadPolicySubCategories = async ({ filters, stateSetter }) => {
  console.log("loadPolicySubCategories Called");
  const policyResponse = await Policy({
    method: "post",
    filters: filters,
    ordering: [["id", "desc"]],
    fields: ["id", CATEGORY_FIELD_NAME, SUBCATEGORY_FIELD_NAME],
  });

  stateSetter(() => {
    const categories = {};
    policyResponse.data.forEach(policy => {
      extendObjectByPath({
        obj: categories,
        path: [policy[CATEGORY_FIELD_NAME], policy[SUBCATEGORY_FIELD_NAME]],
        valueObj: {},
      });
    });
    return categories;
  });
};

export const loadPolicyDetails = async ({ filters, stateSetter }) => {
  console.log("loadPolicyDetails Called");
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

  stateSetter(() => {
    const categories = {};
    policyResponse.data.forEach(policy => {
      extendObjectByPath({
        obj: categories,
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
    return categories;
  });
};

// const loadPolicyData = async ({ filters, fields, stateSetter, path }) => {
//   const policyResponse = await Policy({
//     method: "post",
//     filters: filters,
//     ordering: [["id", "desc"]],
//     fields: ["id", ...fields],
//   });
//
//   stateSetter(prev => ({...prev, ...() => {
//     policyResponse.data.forEach(policy => {
//       extendObjectByPath(prev, [...path], policy)
//   })
//   }}))
//
//
// };

// export const loadCategories = ({iso3, state, })

// the policy router manages shared data among
// policy pages to prevent repeat requests
const PolicyRouter = props => {
  const [setPage, setLoading] = [props.setPage, props.setLoading];
  React.useEffect(() => {
    setPage("policy");
    setLoading(false);
  }, [setLoading, setPage]);

  const { iso3, state, policyID } = useParams();

  const [policyObject, setPolicyObject] = React.useState();

  const [caseload, setCaseload] = React.useState();

  // Get category and subcategory for all policies
  React.useEffect(() => {
    const filters = { iso3: [iso3] };
    if (state !== "national") {
      filters["area1"] = [state];
    }
    loadPolicyCategories({
      filters,
      stateSetter: setPolicyObject,
    });

    //     const loadCategories = async () => {
    //       const policies = await Policy({
    //         method: "post",
    //         filters: filters,
    //         ordering: [["id", "desc"]],
    //         fields: ["id", "primary_ph_measure", "ph_measure_details"],
    //       });
    //
    //       console.log(policies);
    //
    //       const newPolicyObject = {};
    //
    //       policies.data.forEach(policy => {
    //         newPolicyObject[policy.primary_ph_measure] =
    //           newPolicyObject[policy.primary_ph_measure] || {};
    //
    //         newPolicyObject[policy.primary_ph_measure][
    //           policy.ph_measure_details
    //         ] = {
    //           ...newPolicyObject[policy.primary_ph_measure][
    //             policy.ph_measure_details
    //           ],
    //           // the ID prefix is to make sure the IDs
    //           // don't parse as integers so that insertion
    //           // order (and therefore server-side sorting)
    //           // is preserved by Object.entries()
    //           [`ID${policy.id}`]: {},
    //         } || { [`ID${policy.id}`]: {} };
    //       });
    //
    //       setPolicyObject(policyObject => ({
    //         ...policyObject,
    //         ...newPolicyObject,
    //       }));
    //     };
    //     loadCategories();
  }, [iso3, state]);

  console.log("render router");
  return (
    <MiniMap.Provider scope={state !== "national" ? "USA" : "world"}>
      {policyID ? (
        <PolicyPage />
      ) : (
        <ListPoliciesPage {...{ policyObject, setPolicyObject }} />
      )}
    </MiniMap.Provider>
  );
};

export default PolicyRouter;
