// standard packages
import React, { useState, useEffect } from "react";

// 3rd party modules
import MultiSelect from "@kenshooui/react-multi-select";
import "@kenshooui/react-multi-select/dist/style.css";

// assets and styles
import styles from "./filter.module.scss";
import classNames from "classnames";

/**
 * @method Filter
 * create a clickable filter dropdown based on provided items
 * TODO make clickable dropdown
 */
const Filter = ({
  field,
  label,
  items,
  filters,
  setFilters,
  activeFilter,
  setActiveFilter,
  ...props
}) => {
  const [show, setShow] = useState(false);
  const [filterState, setFilterState] = useState({
    items,
    selectedItems: []
  });

  useEffect(() => {
    if (filters === null) {
      setFilterState({ ...filterState, selectedItems: [] });
    }
  }, [filters]);
  const nMax = items !== undefined ? items.length : 0;
  const nCur = filterState.selectedItems.length;

  // define element ID for menu
  const elId = field + "Dropdown";

  // Close filter if user clicks outside it
  if (show) {
    const onClick = e => {
      const el = document.getElementById(elId);
      if (el && el.contains(e.target)) {
        return;
      } else {
        window.removeEventListener("click", onClick);
        setShow(false);
      }
    };
    window.addEventListener("click", onClick);
  }

  const getInputLabel = selectedItems => {
    if (selectedItems.length === 1) return selectedItems[0].label;
    else if (selectedItems.length === nMax) return "All selected";
    else if (selectedItems.length > 0) return "Multiple selected";
    else return "None selected";
  };

  useEffect(() => {
    if (show) setActiveFilter(field);
    else if (activeFilter === field) setActiveFilter(null);
  }, [show]);

  useEffect(() => {
    if (activeFilter !== field) setShow(false);
  }, [activeFilter]);

  return (
    <div className={styles.filter}>
      <div className={styles.label}>{label}</div>
      <div className={styles.input}>
        <div
          role="filterButton"
          className={classNames(styles.filterButton, {
            [styles.shown]: show,
            [styles.selected]: nCur > 0
          })}
          onClick={e => {
            if (activeFilter !== field) {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
            }
            setShow(!show);
          }}
        >
          <span className={styles.field}>
            {getInputLabel(filterState.selectedItems)}
          </span>
          <span className={styles.selections}>
            {" "}
            ({nCur} of {nMax})
          </span>
          <i className={"material-icons"}>arrow_drop_down</i>
        </div>
        <div
          id={elId}
          className={classNames(styles.filterMenu, {
            [styles.shown]: show
          })}
        >
          <MultiSelect
            wrapperClassName={styles.filterMenuWrapper}
            items={items}
            selectedItems={filterState.selectedItems}
            showSelectedItems={false}
            onChange={v => {
              setFilterState({
                ...filterState,
                selectedItems: v
              });

              // update filters
              setFilters({ ...filters, [field]: v.map(d => d.value) });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Filter;
