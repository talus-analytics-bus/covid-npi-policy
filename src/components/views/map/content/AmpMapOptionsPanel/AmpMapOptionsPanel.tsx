import { MapPanel } from "components/common/MapboxMap/content/MapPanel/MapPanel";
import { OptionDrawer } from "components/common/MapOptions";
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

interface AmpMapOptionsPanelProps {
  /**
   * ID of currently-displayed map.
   */
  mapId: MapId;

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
}) => {
  const [prevCircle, setPrevCircle] = useState<string | null | undefined>(null);
  /**
   * The possible geographic resolutions of map that can be viewed.
   */
  const geoOptions: Option[] = [
    {
      name: "US States",
      value: "us",
      description:
        "View data for the United States at the state or county level",
      child: (
        <OptionRadioSet
          key={"subGeoToggle"}
          options={usSubGeoOptions}
          callback={selected => setMapId(selected[0].value as string)}
          selectedOptions={usSubGeoOptions.filter(o => o.value === mapId)}
        />
      ),
    },
    {
      name: "Countries",
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
   * @param key {string} The filter key
   * @param selected {Option[]} The selected options
   */
  const updateFilters = (
    key: "primary_ph_measure" | "ph_measure_details",
    selected: Option[],
    options: Option[],
    allSubOptions: Option[]
  ): void => {
    const newFilters = {
      [key]: selected.map(o => o.value),
      // .filter(o => options.find(oo => oo.value === o)),
    };
    const oldFilters: string[] =
      filters !== undefined && filters[key] !== undefined
        ? filters[key].filter((v: string) => !options.find(o => o.value === v))
        : [];
    newFilters[key] = newFilters[key].concat(oldFilters);
    if (key === "primary_ph_measure") {
      // keep only subfilters that match current main filters
      if (
        filters !== undefined &&
        filters.ph_measure_details !== undefined &&
        filters.ph_measure_details.length > 0
      ) {
        const newSubFilters: string[] = [];
        filters.ph_measure_details.forEach((subcat: string | number) => {
          const subcatOption: Option | undefined = allSubOptions.find(
            o => o.value === subcat
          );
          if (subcatOption !== undefined) {
            const parentCat: Option | undefined = options.find(
              o => o.value === subcatOption.parent
            );
            if (
              parentCat !== undefined &&
              newFilters.primary_ph_measure.includes(parentCat.value)
            )
              newSubFilters.push(subcat as string);
          }
        });
        newFilters.ph_measure_details = newSubFilters;
        // newFilters.primary_ph_measure.forEach((cat: string | number) => {
        //   const catSubCats: Option[] = allSubOptions.filter(
        //     o => o.parent === cat
        //   );
        // });
      }
    }
    if (setFilters !== undefined) setFilters({ ...filters, ...newFilters });
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
              callback={selected =>
                updateFilters(
                  "ph_measure_details",
                  selected,
                  curCatSubcats,
                  subcategoryOptions
                )
              }
              field={"ph_measure_details-" + o.value}
              emptyMeansAll={true}
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
      callback={selected =>
        updateFilters(
          "primary_ph_measure",
          selected,
          categoryOptions,
          subcategoryOptions
        )
      }
      field={"primary_ph_measure"}
    />
  );

  /**
   * List of possible fill metric options.
   */
  const fillOptions: Option[] = getMetricsAsOptions(mapId, "fill", {
    policy_status_counts: fillSubOptions,
  });
  // fillOptions.forEach(o => {
  //   if (o.value === 'policy_status_counts') o.child = child;
  // })

  /**
   * List of policy category suboptions for fill metric option "Relative
   * policy count".
   */
  // const policyCategorySubOptions: Option[] =

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
      tabType={"expand"}
      tabName={"Map options"}
      maxHeight={true}
      bodyStyle={{ padding: "0" }}
      classes={[styles.ampMapOptionsPanel]}
    >
      <OptionDrawer title={"Geographic resolution"}>
        <OptionRadioSet
          key={"geoToggle"}
          options={geoOptions}
          callback={selected => {
            setMapId(selected[0].value as string);
          }}
          selectedOptions={geoOptions.filter(o =>
            mapId.startsWith(o.value as string)
          )}
        />
      </OptionDrawer>
      <OptionDrawer title={"View states by"}>
        <OptionRadioSet
          key={"fillToggle"}
          options={fillOptions}
          selectedOptions={fillOptions.filter(o => o.value === fill)}
          callback={selected => {
            if (setFill !== undefined) setFill(selected[0].value as string);
          }}
        />
      </OptionDrawer>
      <OptionDrawer title={"COVID-19 cases"}>
        <OptionRadioSet
          key={"toggleCircleVisibility"}
          options={circleShowOptions}
          selectedOptions={
            circle !== null ? [circleShowOptions[0]] : [circleShowOptions[1]]
          }
          callback={updateCircle}
        />
      </OptionDrawer>
    </MapPanel>
  );
};

/**
 * Geographic resolutions of USA maps that can be viewed. Currently, state and
 * county maps are supported.
 */
const usSubGeoOptions: Option[] = [
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
