import React from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

import ExpandingSection from "../../PolicyList/ExpandingSection/ExpandingSection";

import MultiSelect from "@kenshooui/react-multi-select";
import "@kenshooui/react-multi-select/dist/style.css";

import styles from "./TargetFilter.module.scss";

import { policyContext } from "../../../PolicyRouter/PolicyRouter";

const API_URL = process.env.REACT_APP_API_URL;

const TargetFilter = props => {
  const {
    targets,
    setTargets,
    setStatus,
    setPolicyObject,
    setPolicyFilters,
  } = React.useContext(policyContext);

  const [filterOpen, setFilterOpen] = React.useState(false);

  const onSelect = items => {
    setTargets(prev => ({ ...prev, selected: items }));
    setPolicyObject({});
    setStatus(prev => ({
      ...prev,
      policies: "initial",
      searchResults: "initial",
    }));
    setPolicyFilters(prev => ({
      ...prev,
      subtarget: items.length > 0 ? items.map(i => i.value) : undefined,
    }));
  };
  //
  //   React.useEffect(() => {
  //     setPolicyObject({});
  //     setStatus(prev => ({
  //       ...prev,
  //       policies: "initial",
  //       searchResults: "initial",
  //     }));
  //     setPolicyFilters(prev => ({
  //       ...prev,
  //       subtarget:
  //         targets.selected && targets.selected.length > 0
  //           ? targets.selected.map(i => i.value)
  //           : undefined,
  //     }));
  //   }, [setPolicyFilters, targets.selected, setPolicyObject, setStatus]);

  const location = useLocation();

  React.useEffect(() => {
    const getOptions = async () => {
      const [iso3, state] = location.pathname
        .replace(/\/$/, "")
        .split("/")
        .slice(-2);

      const request = await axios(`${API_URL}/get/optionset`, {
        params: {
          fields: "Policy.subtarget",
          geo_res: state !== "national" ? "state" : "country",
          ...(state !== "national" && { state_name: state }),
          ...(state === "national" && { iso3: iso3 }),
        },
      });

      setTargets(prev => ({ ...prev, all: request.data.data.subtarget }));
    };

    getOptions();
  }, [location, setTargets]);

  return (
    <div className={styles.filter}>
      <span className={styles.label}>POLICY TARGET</span>
      <ExpandingSection
        floating
        open={filterOpen}
        onOpen={() => setFilterOpen(true)}
        onClose={() => setFilterOpen(false)}
      >
        <span className={styles.buttonLabel}>
          {targets.selected.length} selected
        </span>
        <div className={styles.filterFrame}>
          <MultiSelect
            showSelectedItems={false}
            items={targets.all}
            selectedItems={targets.selected}
            onChange={onSelect}
          />
        </div>
      </ExpandingSection>
    </div>
  );
};

export default TargetFilter;
