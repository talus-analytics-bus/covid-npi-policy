import PerfectScrollbar from "react-perfect-scrollbar";
import { MapPanel } from "components/common/MapboxMap/content/MapPanel/MapPanel";
import {
  OptionRadioSet,
  OptionCheckboxSet,
} from "components/common/OptionControls";
import { Option } from "components/common/OptionControls/types";
import React, { FC, ReactElement, useContext, useState } from "react";
import {
  Filters,
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
import { getFiltersForApi, updateFilters } from "./helpers";

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
  setMapId(newMapId: MapId): void;

  catOptions: Option[];
  subcatOptions: Option[];
}
export const AmpMapOptionsPanel: FC<AmpMapOptionsPanelProps> = ({
  mapId,
  setMapId,
  catOptions,
  subcatOptions,
  panelSetId = 0,
}) => {
  const { setInfoTooltipContent } = useContext(InfoTooltipContext);
  const [noChildCats, setNoChildCats] = useState<Option[]>([]);
  const [prevCircle, setPrevCircle] = useState<string | null | undefined>(null);
  const infoTooltipSize: number = 8;

  /**
   * The possible geographic resolutions of map that can be viewed.
   */
  const geoOptions: Option[] = [
    {
      name: "United States",
      value: "us-county-plus-state",
      isChecked: v => {
        return typeof v === "string" && v.startsWith("us");
      },
      description:
        "View data for the United States at the state and/or county level",
      child: (
        <OptionRadioSet
          key={"subGeoToggle"}
          options={usSubGeoOptions}
          callback={selected => setMapId(selected[0].value as MapId)}
          selectedOptions={usSubGeoOptions.filter(o => o.value === mapId)}
          {...{ setInfoTooltipContent, infoTooltipSize }}
        />
      ),
    },
    {
      name: "World (country-level policies)",
      value: "global",
      description: "View data for the world at the country level",
      isChecked: v => v === "global",
    },
  ];
  const curMapOptions = useContext(MapOptionContext);
  const {
    circle,
    setCircle,
    fill,
    setFill,
    filters: filtersForApi,
    setFilters: setFiltersForApi,
  } = curMapOptions;

  const [filters, setFilters] = useState<Filters>(filtersForApi || {});

  /**
   * List of possible circle metric options.
   */
  const circleOptions: Option[] = getMetricsAsOptions(mapId, "circle");
  console.log(
    filters &&
      filters.subtarget !== undefined &&
      filters.subtarget.includes("Omicron")
      ? [{ name: "Omicron only", value: "only" }]
      : [{ name: "All policies", value: "all" }]
  );

  const fillSubOptions: ReactElement = (
    <>
      <OptionRadioSet
        title={"Variant focus"}
        options={[
          { name: "All policies", value: "all" },
          { name: "Omicron policies only", value: "only" },
        ]}
        selectedOptions={
          filters &&
          filters.subtarget !== undefined &&
          filters.subtarget.includes("Omicron")
            ? [{ name: "Omicron only", value: "only" }]
            : [{ name: "All policies", value: "all" }]
        }
        callback={selected => {
          if (setFiltersForApi === undefined) return;
          // add or remove subtargets from filters
          const newFilters: Filters = { ...filters };
          const newFiltersForApi: Filters = { ...filtersForApi };
          if (selected[0].value === "only") {
            newFilters.subtarget = ["Omicron"];
            newFiltersForApi.subtarget = ["Omicron"];
          } else {
            delete newFilters.subtarget;
            delete newFiltersForApi.subtarget;
          }
          setFilters(newFilters);
          setFiltersForApi(newFiltersForApi);
        }}
        key={"subtarget"}
        // clearAll={false}
        {...{ setInfoTooltipContent }}
      />
      <OptionCheckboxSet
        title={"Policy category"}
        options={catOptions.map(o => {
          const curCatSubcats: Option[] = subcatOptions.filter(
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
                    filters.ph_measure_details.includes(o.value as string)
                )}
                callback={selected => {
                  if (setFiltersForApi === undefined) return;

                  // if any cats selected but no subcats selected, mark as indet
                  const updatedNoChildCats: Option[] = [...noChildCats].filter(
                    (ncc: Option) => {
                      return ncc.value !== (o.value as string);
                    }
                  );
                  const updatedFilters: Filters = updateFilters(
                    "ph_measure_details",
                    filters,
                    setFilters,
                    selected,
                    curCatSubcats,
                    subcatOptions
                  );

                  // if category missing for selected subcats, add it
                  if (
                    updatedFilters.primary_ph_measure !== undefined &&
                    selected.length > 0
                  ) {
                    if (
                      !updatedFilters.primary_ph_measure.includes(
                        o.value as string
                      )
                    )
                      updatedFilters.primary_ph_measure.push(o.value as string);
                  }

                  if (
                    selected.length === 0 &&
                    updatedFilters !== undefined &&
                    updatedFilters.primary_ph_measure !== undefined &&
                    updatedFilters.primary_ph_measure.includes(
                      o.value as string
                    )
                  )
                    updatedNoChildCats.push(o);

                  setNoChildCats(updatedNoChildCats);

                  const updatedFiltersForApi: Filters = getFiltersForApi(
                    updatedFilters,
                    updatedNoChildCats
                  );
                  setFiltersForApi(updatedFiltersForApi);
                }}
                field={"ph_measure_details-" + o.value}
                emptyMeansAll={false}
                selectAll={true}
              />
            ),
          };
          return newChild;
        })}
        selectedOptions={catOptions.filter(
          o =>
            filters &&
            filters.primary_ph_measure !== undefined &&
            filters.primary_ph_measure.includes(o.value as string)
        )}
        callback={selected => {
          if (setFiltersForApi === undefined) return;
          updateFilters(
            "primary_ph_measure",
            filters,
            setFilters,
            selected,
            catOptions,
            subcatOptions,
            setFiltersForApi,
            noChildCats
          );
        }}
        field={"primary_ph_measure"}
        clearAll={true}
        {...{ setInfoTooltipContent }}
      />
    </>
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
        const circleToShow: string | null | undefined =
          prevCircle || defaults[mapId].circle;
        if (selected[0].value === "show" && circleToShow !== undefined)
          setCircle(circleToShow);
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
            setMapId(selected[0].value as MapId);
          }}
          selectedOptions={geoOptions.filter(
            o => o.isChecked !== undefined && o.isChecked(mapId)
          )}
          {...{ setInfoTooltipContent, infoTooltipSize }}
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
            {...{ setInfoTooltipContent, infoTooltipSize }}
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
          {...{ setInfoTooltipContent, infoTooltipSize }}
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
    name: "State-level policies only",
    value: "us",
    description: "View policies at the state level",
  },
  {
    name: "County-level policies only",
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
