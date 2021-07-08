import React from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

import ExpandingSection from "../../PolicyList/ExpandingSection/ExpandingSection";

import MultiSelect from "@kenshooui/react-multi-select";
import "@kenshooui/react-multi-select/dist/style.css";

import styles from "./JurisdictionControl.module.scss";

import { policyContext } from "../../../PolicyRouter/PolicyRouter";

const API_URL = process.env.REACT_APP_API_URL;

const TargetFilter = props => {
  const {
    jurisdiction,
    setJurisdiction,
    setStatus,
    setPolicyObject,
    setPolicyFilters,
  } = React.useContext(policyContext);

  const [filterOpen, setFilterOpen] = React.useState(false);

  const onSelect = items => {
    setJurisdiction(prev => ({ ...prev, selected: items }));
    setPolicyObject({});
    setStatus(prev => ({
      ...prev,
      policies: "initial",
      searchResults: "initial",
    }));
    setPolicyFilters(prev => ({
      ...prev,
      level: items.length > 0 ? items.map(i => i.value) : undefined,
    }));
  };

  return (
    <div className={styles.filter}>
      <span className={styles.label}>JURISDICTION</span>
      <ExpandingSection
        floating
        open={filterOpen}
        onOpen={() => setFilterOpen(true)}
        onClose={() => setFilterOpen(false)}
      >
        <span className={styles.buttonLabel}>
          {jurisdiction.selected.length > 0
            ? `${jurisdiction.selected.length} selected`
            : `—`}
        </span>
        <div className={styles.filterFrame}>
          <MultiSelect
            showSelectedItems={false}
            items={jurisdiction.all}
            selectedItems={jurisdiction.selected}
            onChange={onSelect}
          />
        </div>
      </ExpandingSection>
    </div>
  );
};

export default TargetFilter;
