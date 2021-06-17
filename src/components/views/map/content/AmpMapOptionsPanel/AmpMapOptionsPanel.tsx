import PerfectScrollbar from "react-perfect-scrollbar";
import { MapPanel } from "components/common/MapboxMap/content/MapPanel/MapPanel";
import {
  OptionRadioSet,
  OptionCheckboxSet,
} from "components/common/OptionControls";
import { Option } from "components/common/OptionControls/types";
import React, { FC, ReactElement, useContext, useState } from "react";
import {
  MapId,
  MapMetric,
  MetricMeta,
  MetricMetaEntry,
} from "components/common/MapboxMap/plugins/mapTypes";
import { OptionSelect } from "components/common/OptionControls/OptionSelect/OptionSelect";
import MapOptionContext from "../../context/MapOptionContext";
import {
  allMapMetrics,
  defaults,
  metricMeta,
} from "components/common/MapboxMap/plugins/data";
import styles from "./AmpMapOptionsPanel.module.scss";
import AccordionDrawer from "components/common/MapOptions/AccordionDrawer/AccordionDrawer";
import InfoTooltipContext from "context/InfoTooltipContext";

interface AmpMapOptionsPanelProps {
  /**
   * ID of currently-displayed map.
   */
  mapId: MapId;
  panelSetId?: number;

  /**
   * Setter function for this map's `mapId`, which determines what source is
   * used for the map.
   * @param newMapId The new `mapId` to which the map component should be set.
   */
  setMapId(newMapId: string): void;

  categoryOptions: Option[];
  subcategoryOptions: Option[];
}
export const AmpMapOptionsPanel: FC<AmpMapOptionsPanelProps> = ({
  mapId,
  setMapId,
  categoryOptions,
  subcategoryOptions,
  panelSetId = 0,
}) => {
  const { setInfoTooltipContent } = useContext(InfoTooltipContext);
  const [prevCircle, setPrevCircle] = useState<string | null | undefined>(null);
  /**
   * The possible geographic resolutions of map that can be viewed.
   */
  const geoOptions: Option[] = [
    {
      name: "United States",
      value: "us-county-plus-state",
      description:
        "View data for the United States at the state and/or county level",
      child: (
        <OptionRadioSet
          key={"subGeoToggle"}
          options={usSubGeoOptions}
          callback={selected => setMapId(selected[0].value as string)}
          selectedOptions={usSubGeoOptions.filter(o => o.value === mapId)}
          {...{ setInfoTooltipContent }}
        />
      ),
    },
    {
      name: "World (country-level policies)",
      value: "global",
      description: "View data for the world at the country level",
    },
  ];
  const curMapOptions = useContext(MapOptionContext);
  const {
    circle,
    setCircle,
    fill,
    setFill,
    filters,
    setFilters,
  } = curMapOptions;

  /**
   * List of possible circle metric options.
   */
  const circleOptions: Option[] = getMetricsAsOptions(mapId, "circle");

  /**
   * Update the filters for the specified key to consist of the
   * specified options.
   * @param {string} key The filter key
   * @param {Option[]} selected
   * The currently selected options for the optionset
   * @param {Option[]} options
   * The possible options for the optionset
   * @param {Option[]} allSubOptions
   * If applicable, all suboptions that could be used in the optionset that has
   * the defined `key`
   */
  const updateFilters = (
    key: "primary_ph_measure" | "ph_measure_details",
    selected: Option[],
    options: Option[],
    allSubOptions: Option[]
  ): void => {
    // if filter state variables undefined, abort
    if (filters === undefined || setFilters === undefined) return;

    // initialized current and updated filters
    const currentFilters: Record<string, any> = {
      primary_ph_measure: [],
      ph_measure_details: [],
      ...filters,
    };
    const updatedFilters: Record<string, any> = {
      primary_ph_measure: [],
      ph_measure_details: [],
    };

    // if category filter being updated:
    if (key === "primary_ph_measure") {
      // update category filters
      // set updated category filters to equal selected values
      updatedFilters[key] = selected.map(o => o.value);

      // update subcategory filters
      // Set updated subcat filters equal to current subcat filters except
      // those whose cats aren't in selected values
      updatedFilters.ph_measure_details = currentFilters.ph_measure_details;
      updatedFilters["ph_measure_details"] = currentFilters[
        "ph_measure_details"
      ].filter((v: string) => {
        const subcatOption: Option | undefined = allSubOptions.find(
          o => o.value === v
        );
        const keepSubcatFilter: boolean =
          subcatOption !== undefined &&
          updatedFilters.primary_ph_measure.includes(subcatOption.value);
        return keepSubcatFilter;
      });
      // For each updated cat filter, if no subcats for it are in updated
      // subcat filters, add every possible subcat
      updatedFilters.primary_ph_measure.forEach((v: string) => {
        const possibleCatSubcats: string[] = allSubOptions
          .filter(o => o.parent === v)
          .map(o => o.value as string);
        const addAllCatSubcats = !updatedFilters.ph_measure_details.some(
          (v: string) => {
            return possibleCatSubcats.includes(v);
          }
        );
        if (addAllCatSubcats) {
          updatedFilters.ph_measure_details = updatedFilters.ph_measure_details.concat(
            possibleCatSubcats
          );
        }
      });

      // if no
    } else if (key === "ph_measure_details") {
      // Remove all values from subcat filters that belong to the parent of
      // this checkbox set
      updatedFilters.primary_ph_measure = currentFilters.primary_ph_measure;
      const possibleCatSubcats: string[] = options.map(o => o.value as string);
      updatedFilters.ph_measure_details = currentFilters.ph_measure_details;
      updatedFilters.ph_measure_details = updatedFilters.ph_measure_details.filter(
        (v: string) => {
          return !possibleCatSubcats.includes(v);
        }
      );
      updatedFilters.ph_measure_details = updatedFilters.ph_measure_details.concat(
        selected.map(o => o.value as string)
      );
    }
    setFilters(updatedFilters);
  };

  const fillSubOptions: ReactElement = (
    <OptionCheckboxSet
      title={"Policy category"}
      options={categoryOptions.map(o => {
        const curCatSubcats: Option[] = subcategoryOptions.filter(
          so => so.parent === o.value
        );

        const newChild: Option = {
          ...o,
          child: (
            <OptionCheckboxSet
              title={"Subcategory"}
              options={curCatSubcats}
              selectedOptions={curCatSubcats.filter(
                o =>
                  filters &&
                  filters.ph_measure_details !== undefined &&
                  filters.ph_measure_details.includes(o.value)
              )}
              callback={selected => {
                updateFilters(
                  "ph_measure_details",
                  selected,
                  curCatSubcats,
                  subcategoryOptions
                );
              }}
              field={"ph_measure_details-" + o.value}
              emptyMeansAll={true}
              selectAll={true}
            />
          ),
        };
        return newChild;
      })}
      selectedOptions={categoryOptions.filter(
        o =>
          filters &&
          filters.primary_ph_measure !== undefined &&
          filters.primary_ph_measure.includes(o.value)
      )}
      callback={selected => {
        updateFilters(
          "primary_ph_measure",
          selected,
          categoryOptions,
          subcategoryOptions
        );
      }}
      field={"primary_ph_measure"}
      clearAll={true}
      {...{ setInfoTooltipContent }}
    />
  );

  /**
   * List of possible fill metric options.
   */
  const fillOptions: Option[] = getMetricsAsOptions(mapId, "fill", {
    policy_status_counts: fillSubOptions,
  });

  /**
   * List of possible circle show/hide options with option select for circle
   * metric to show.
   */
  const circleShowOptions: Option[] = [
    {
      name: "Show",
      value: "show",
      child: (
        <OptionSelect
          title={"Cases"}
          options={circleOptions}
          selectedOptions={circleOptions.filter(o => o.value === circle)}
          callback={selected => {
            if (setCircle !== undefined) setCircle(selected[0].value as string);
          }}
          {...{ setInfoTooltipContent }}
        />
      ),
    },
    { name: "Hide", value: "hide" },
  ];
  const updateCircle = (selected: Option[]): void => {
    if (selected.length > 0) {
      if (setCircle !== undefined) {
        if (selected[0].value === "show")
          setCircle(prevCircle || defaults[mapId].circle);
        else {
          setPrevCircle(circle);
          setCircle(null);
        }
      }
    }
  };

  return (
    <MapPanel
      tabName={"Map options"}
      maxHeight={true}
      bodyStyle={{
        padding: "0",
      }}
      drawerPanel={true}
      classes={[styles.ampMapOptionsPanel]}
      {...{ panelSetId }}
    >
      <AccordionDrawer title={"Geographic resolution"}>
        <OptionRadioSet
          key={"geoToggle"}
          options={geoOptions}
          callback={selected => {
            setMapId(selected[0].value as string);
          }}
          selectedOptions={geoOptions.filter(o =>
            mapId.startsWith(o.value as string)
          )}
          {...{ setInfoTooltipContent }}
        />
      </AccordionDrawer>
      <AccordionDrawer title={getFillOptionsTitleFromMapId(mapId)}>
        <PerfectScrollbar>
          <OptionRadioSet
            key={"fillToggle"}
            options={fillOptions}
            selectedOptions={fillOptions.filter(o => o.value === fill)}
            callback={selected => {
              if (setFill !== undefined) setFill(selected[0].value as string);
            }}
            {...{ setInfoTooltipContent }}
          />
        </PerfectScrollbar>
      </AccordionDrawer>
      <AccordionDrawer title={"COVID-19 cases"}>
        <OptionRadioSet
          key={"toggleCircleVisibility"}
          options={circleShowOptions}
          selectedOptions={
            circle !== null ? [circleShowOptions[0]] : [circleShowOptions[1]]
          }
          callback={updateCircle}
          {...{ setInfoTooltipContent }}
        />
      </AccordionDrawer>
    </MapPanel>
  );
};

/**
 * Geographic resolutions of USA maps that can be viewed. Currently, state and
 * county maps are supported.
 */
const usSubGeoOptions: Option[] = [
  {
    name: "State-level and county-level policies",
    value: "us-county-plus-state",
    description:
      "View policies at the state and county levels on a map of counties",
  },
  {
    name: "State-level policies",
    value: "us",
    description: "View policies at the state level",
  },
  {
    name: "County-level policies",
    value: "us-county",
    description: "View policies at the county level",
  },
];
/**
 * Given the ID of the map, returns the fill options drawer title to use
 * @param mapId The ID of the map for which the fill options title is needed
 * @returns {string} The fill options drawer title to use for the map
 */
function getFillOptionsTitleFromMapId(mapId: MapId): string {
  switch (mapId) {
    case "us":
      return "View states by";
    case "us-county":
    case "us-county-plus-state":
      return "View counties by";
    case "global":
      return "View countries by";
    default:
      return "View locations by";
  }
}

/**
 * Given the ID of the map and the shape type, returns a list of options
 * corresponding to the metrics that can be shown on the map with the shape.
 * @param mapId The ID of the map for which metrics are needed
 * @param shape The map shape for which metrics are needed, "circle" or "fill"
 * @returns {Option[]} The selection options corresponding to the metrics
 */
function getMetricsAsOptions(
  mapId: MapId,
  shape: "circle" | "fill",
  children?: Record<string, ReactElement>
): Option[] {
  return (allMapMetrics[mapId] as MapMetric[])
    .filter((m: MapMetric) => m.for.includes(shape))
    .map((m: MapMetric) => {
      const meta: MetricMetaEntry = (metricMeta as MetricMeta)[
        m.id as string
      ] as MetricMetaEntry;
      // return data formatted as options
      return {
        name: meta.metric_displayname,
        value: m.id,
        description: meta.metric_definition,
        child:
          children !== undefined && children[m.id] !== undefined
            ? children[m.id]
            : undefined,
      };
    });
}
