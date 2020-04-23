import React from "react";
import styles from "./checkboxset.module.scss";
import Checkbox from "./content/Checkbox";

/**
 * @method CheckboxSet
 */
const CheckboxSet = ({ label, choices, callback, curVal, ...props }) => {
  const [allValues, setAllValues] = React.useState(curVal);

  // Trigger callback when all values change
  React.useEffect(() => {
    callback([...new Set(allValues.join(",").split(","))]);
  }, [allValues]);

  const updateAllValues = v => {
    const oldAllValues = JSON.parse(JSON.stringify(allValues));
    const remove = oldAllValues.includes(v);
    if (remove) {
      const updatedAllValues = oldAllValues.filter(d => d !== v);
      setAllValues(updatedAllValues);
    } else {
      const updatedAllValues = oldAllValues;
      updatedAllValues.push(v);
      setAllValues(updatedAllValues);
    }
  };

  const checkboxes = choices.map(d => (
    <Checkbox
      {...{
        label: d.name,
        disabled: props.disabled,
        value: d.value,
        callback: v => {
          updateAllValues(v);
        },
        curChecked: allValues.includes(d.value.join(","))
      }}
    />
  ));
  return (
    <div className={styles.checkboxSet}>
      <div role="label" className={styles.label}>
        {label}
      </div>
      <div className={styles.checkboxContainer}>{checkboxes}</div>
    </div>
  );
};

export default CheckboxSet;
