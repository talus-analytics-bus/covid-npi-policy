import { LabeledIcon } from "components/common/MapboxMap/mapPopup/content/PopupBody/LabeledIcon/LabeledIcon";
import PolicyCategoryIcon from "components/views/PolicyPage/PolicyCategoryIcon/PolicyCategoryIcon";
import React, { FC, ReactElement } from "react";
import * as FMT from "components/misc/FormatAndDisplay/FormatAndDisplay";
import { NO_POLICY_FOR_LOC_MSG } from "components/views/map/content/AmpMapPopupDataProvider/helpers";
import { Option } from "components/common/OptionControls/types";
import { getPolicyCatSubcatPhrase } from "../helpers";

type ComponentProps = {
  categories: string[];
  subcategories: string[];
  count: number | null;
  subcatOptions?: Option[];
};
export const PolicyCount: FC<ComponentProps> = ({
  categories,
  subcategories,
  subcatOptions = [],
  count,
}): ReactElement => {
  if (count !== null) {
    // define plurality form of "policy" to use
    const noun = count !== 1 ? "policies" : "policy";

    // special case: categories ["None"] --> subcat. filters need to be chosen
    const isNone: boolean = categories.length === 1 && categories[0] === "None";

    // get string to express categories
    const categoryPhrase: string = getPolicyCatSubcatPhrase(
      categories,
      subcategories,
      subcatOptions,
      noun
    );

    return (
      <LabeledIcon
        {...{
          icon: (
            <PolicyCategoryIcon
              category={categories}
              style={{
                margin: "0",
              }}
              blankIfNone={true}
            />
          ),
          label: (
            <div>
              {!isNone && (
                <strong>
                  <FMT.ExactNumber>{count}</FMT.ExactNumber>{" "}
                </strong>
              )}
              {!isNone && categoryPhrase}
              {isNone && <FMT.Subtle>{categoryPhrase}</FMT.Subtle>}
            </div>
          ),
          maxLabelWidth: 170,
        }}
      />
    );
  } else
    return (
      <LabeledIcon
        {...{
          icon: null,
          label: <FMT.Subtle>{NO_POLICY_FOR_LOC_MSG}</FMT.Subtle>,
          maxLabelWidth: 170,
        }}
      />
    );
};

export default PolicyCount;
