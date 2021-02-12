import React from "react";
import { useLocation } from "react-router-dom";

import {
  CATEGORY_FIELD_NAME,
  SUBCATEGORY_FIELD_NAME,
} from "../../../PolicyRouter/PolicyLoaders";

import { Policy } from "../../../../../misc/Queries";

import PolicySummary from "../../../PolicySummary/PolicySummary";

import { policyContext } from "../../../PolicyRouter/PolicyRouter";

import styles from "./SourceSummary.module.scss";

const API_URL = process.env.REACT_APP_API_URL;

const formatDate = date => {
  if (!date) return undefined;
  return date.toLocaleString("en-de", {
    day: "numeric",
    month: "short",
    year: "numeric",
    // timeZone: "UTC",
  });
};

const formatSentenceFromArray = arr => {
  const unique = [...new Set(arr)];
  if (unique.length === 1) return unique[0].toLowerCase();
  else
    return `${unique.slice(0, -1).join(", ")}, and
      ${unique[unique.length - 1]}`.toLowerCase();
};

const SourceSummary = ({ policy, setModalOpen }) => {
  const { policyFilters } = React.useContext(policyContext);

  console.log(policy);

  const [policies, setPolicies] = React.useState();

  const [iso3, state] = useLocation()
    .pathname.replace(/\/$/, "")
    .split("/")
    .slice(-3);

  React.useEffect(() => {
    const getPoliciesInDocument = async () => {
      const policyResponse = await Policy({
        method: "post",
        pagesize: 100,
        filters: { policy_number: [policy.policy_number] },
        fields: [
          "id",
          CATEGORY_FIELD_NAME,
          SUBCATEGORY_FIELD_NAME,
          "date_start_effective",
          "date_end_actual",
          "policy_name",
          "auth_entity",
          "subtarget",
          "desc",
        ],
      });

      setPolicies(policyResponse.data);
    };

    if (policy && policy.policy_number) getPoliciesInDocument();
  }, [policy]);

  const summaries =
    policies &&
    policies.map(policy => {
      let path = [
        policy[CATEGORY_FIELD_NAME],
        "children",
        policy.auth_entity[0].place.level,
        "children",
        policy[SUBCATEGORY_FIELD_NAME],
      ];

      const place = policy.auth_entity[0].place;

      if (
        (policyFilters.iso3[0] === "USA" && place.level === "Local") ||
        (policyFilters.iso3[0] !== "USA" &&
          place.level === "State / Province") ||
        policyFilters.iso3[0] === "Unspecified"
      ) {
        path = [...path, "children", policy.auth_entity[0].place.loc];
      }

      path = [...path, "children", `ID${policy.id}`];

      return (
        <div onClick={() => setModalOpen(false)} key={path}>
          <PolicySummary
            showAllMetadata
            path={path}
            location={[iso3, state]}
            policy={policy}
            wordLimit={50}
          />
        </div>
      );
    });

  const policyCategoriesText =
    policies &&
    formatSentenceFromArray(
      policies
        .map(policy => policy[CATEGORY_FIELD_NAME])
        .filter(target => target !== "Unspecified")
    );

  const policyTargetsText =
    policies &&
    formatSentenceFromArray(
      policies
        .map(
          policy =>
            policy.subtarget &&
            policy.subtarget
              .filter(target => target !== "Unspecified")
              .map(s => s.replace(/(\([^)]+\))/g, "").trim())
        )
        .flat()
    );

  return (
    <div className={styles.sourceSummary}>
      <header className={styles.header}>
        <h1>Document</h1>
        <h2>{policy && policy.policy_name}</h2>
        <p>
          {policy && policy.policy_name} was issued on{" "}
          {policy && formatDate(new Date(policy.date_issued))} by the{" "}
          {policy && policy.auth_entity[0].office}.{" "}
          {policies && (
            <>
              It contains {policies.length} policies covering{" "}
              {policyCategoriesText}.
            </>
          )}
        </p>
        {policies && <p>These policy measures target {policyTargetsText}.</p>}
        <div className={styles.policiesHeader}>
          <h2>Policies in this Document</h2>
          {policy.file && policy.file[0] && (
            <a
              href={
                policy && `${API_URL}/get/file/redirect?id=${policy.file[0]}`
              }
              className={styles.button}
            >
              DOWNLOAD (PDF)
            </a>
          )}
        </div>
      </header>
      <section className={styles.listPolicies}>{summaries}</section>
    </div>
  );
};

export default SourceSummary;
