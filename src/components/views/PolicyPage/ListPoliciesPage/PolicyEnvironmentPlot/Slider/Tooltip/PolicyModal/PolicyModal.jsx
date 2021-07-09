import React from "react";
import { useLocation } from "react-router-dom";

import Modal from "../../../../../Modal/Modal";

import {
  CATEGORY_FIELD_NAME,
  loadFullPolicy,
  SUBCATEGORY_FIELD_NAME,
} from "../../../../../PolicyRouter/PolicyLoaders";

import { Policy } from "api/Queries";

import { policyContext } from "../../../../../PolicyRouter/PolicyRouter";

import PolicySummary from "../../../../../PolicySummary/PolicySummary";

import styles from "./PolicyModal.module.scss";

const formatDate = date => {
  if (!date) return undefined;
  return new Date(date).toLocaleString("en-de", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const PolicyModal = ({
  children,
  category,
  policies,
  sliderDate,
  popupVisible,
}) => {
  const { setPolicyObject, policySort } = React.useContext(policyContext);
  const [modalOpen, setModalOpen] = React.useState(false);

  const buttonClick = e => {
    e.preventDefault();
    e.stopPropagation();
    setModalOpen(true);
  };

  const [iso3, state] = useLocation()
    .pathname.replace(/\/$/, "")
    .split("/")
    .slice(-3);

  const [policyData, setPolicyData] = React.useState();

  React.useEffect(() => {
    const getPoliciesByIds = async () => {
      const policyResponse = await Policy({
        method: "post",
        pagesize: 100,
        filters: { id: [...policies] },
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

      setPolicyData(policyResponse.data);
    };

    if (popupVisible) getPoliciesByIds();
  }, [popupVisible]);

  React.useEffect(() => {
    const preloadPolicies = async () => {
      loadFullPolicy({
        filters: { id: [...policies] },
        stateSetter: setPolicyObject,
        sort: policySort,
      });
    };

    if (modalOpen) preloadPolicies();
  }, [modalOpen]);

  const summaries =
    policyData &&
    policyData.map(policy => {
      let path = [
        policy[CATEGORY_FIELD_NAME],
        // "children",
        // policy.auth_entity[0].place.level,
        "children",
        policy[SUBCATEGORY_FIELD_NAME],
      ];

      const place = policy.auth_entity[0].place;

      // if (
      //   (policyFilters.iso3[0] === "USA" && place.level === "Local") ||
      //   (policyFilters.iso3[0] !== "USA" &&
      //     place.level === "State / Province") ||
      //   policyFilters.iso3[0] === "Unspecified"
      // ) {
      //   path = [...path, "children", policy.auth_entity[0].place.loc];
      // }

      path = [...path, "children", `ID${policy.id}`];

      return (
        <div onClick={() => setModalOpen(false)} key={path}>
          <PolicySummary
            showAllMetadata
            path={path}
            // location={[iso3, state]}
            policy={policy}
            wordLimit={50}
          />
        </div>
      );
    });

  return (
    <>
      <button className={styles.button} onClick={buttonClick}>
        {children}
      </button>
      <Modal open={modalOpen} setOpen={setModalOpen}>
        <section className={styles.policyModal}>
          <h2>
            {category} policies enacted on{" "}
            {formatDate(sliderDate.toISOString().substring(0, 10))}
          </h2>
          <div className={styles.summaries}>{summaries}</div>
        </section>
      </Modal>
    </>
  );
};

export default PolicyModal;
