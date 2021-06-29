import React, { Dispatch, SetStateAction } from "react";
import { useState, useEffect } from "react";
import moment from "moment";

// common components
import Search from "../../common/Table/content/Search/Search";
import { FilterSet, Table, RadioToggle } from "../../common";
import { DownloadBtn, PageHeader } from "components/project";
import Drawer from "../../layout/drawer/Drawer";
import { Metadata, OptionSet, execute } from "api/Queries";
import { comma } from "../../misc/Util.js";
import { isEmpty } from "components/misc/UtilsTyped";

// styles and assets
import styles from "./data.module.scss";
import colors from "assets/styles/vars.module.scss";

// constants
import policyInfo from "./content/policy";
import planInfo from "./content/plan";
import challengeInfo from "./content/challenge.js";
import { FC } from "react";
import {
  FilterDefs,
  Filters,
} from "components/common/MapboxMap/plugins/mapTypes";
import { DataPageInfo } from "./content/types";
import { ApiResponse, ApiResponseIndexed } from "api/responseTypes";
import { DataRecord, MetadataRecord } from "components/misc/dataTypes";
import { OptionSetRecord } from "api/queryTypes";
import { useCallback } from "react";
import { DataColumnDef } from "components/common/Table/Table";
import Settings from "Settings";
import { safeGetFieldValsAsStrings } from "./content/helpers";
import { ControlLabel } from "components/common/OptionControls";
import { Link } from "react-router-dom";

/**
 * The different types of data page that can be viewed: `policy`, `plan`, and
 * `challenge`.
 *
 * NOTE: `challenge` is currently disabled.
 */
type DataPageType = "policy" | "plan" | "challenge";

interface DataArgs {
  /**
   * True if the page is currently loading, false otherwise.
   */
  loading: boolean;

  /**
   * Sets whether the page is currently loading.
   */
  setLoading: Dispatch<SetStateAction<boolean>>;

  /**
   * Sets the stringified HTML of the currently displayed tooltip content.
   */
  setInfoTooltipContent: Dispatch<SetStateAction<string>>;

  /**
   * Sets the current page.
   */
  // TODO make page an enum
  setPage: Dispatch<SetStateAction<string>>;

  /**
   * Defines the URL filter parameters for policy data.
   */
  urlFilterParamsPolicy: Filters;

  /**
   * Defines the URL filter parameters for plan data.
   */
  urlFilterParamsPlan: Filters;

  /**
   * Defines the URL filter parameters for court challenge data.
   * @unused
   */
  urlFilterParamsChallenge: Filters;

  /**
   * The type, i.e., mode, of the data page, that determines what kind of data
   * are being displayed.
   */
  type: DataPageType;
}

/**
 * Define valid place types for use in `PlaceType
 */
const validPlaceTypes = ["affected", "jurisdiction"] as const;

/**
 * The type of place in the COVID AMP dataset, either `affected` for the place
 * affected by a policy, or `jurisdiction` for the place making the policy.
 */
export type PlaceType = typeof validPlaceTypes[number];

// primary data viewing and download page
const Data: FC<DataArgs> = ({
  loading,
  setLoading,
  setInfoTooltipContent,
  setPage,
  urlFilterParamsPolicy,
  urlFilterParamsPlan,
  urlFilterParamsChallenge,
  type,
}) => {
  const [docType, setDocType] = useState<DataPageType>(type || "policy");

  const defaultPlaceType: PlaceType = getParamsPlaceType() || "affected";
  const [placeType, setPlaceType] = useState<PlaceType>(defaultPlaceType);

  // TODO update type assignment when policy.js is rewritten in TSX
  const [entityInfo, setEntityInfo] = useState<DataPageInfo>(
    policyInfo as DataPageInfo
  );
  const [curPage, setCurPage] = useState<number>(1);
  const [numInstances, setNumInstances] = useState<number | null>(null);
  const [ordering, setOrdering] = useState<[string, string][]>(
    docType === "challenge"
      ? [["date_of_complaint", "desc"]]
      : [["date_start_effective", "desc"]]
  );
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [pagesize, setPagesize] = useState<number>(5);

  // set `unspecified` component, etc., from entity info
  const nouns = entityInfo.nouns;

  // define data and metadata for table
  const [data, setData] = useState<DataRecord[] | null>(null);

  const [metadata, setMetadata] = useState<MetadataRecord[] | null>(null);

  // define filters
  const getFiltersFromUrlParams: Function = useCallback((): Filters => {
    // If filters are specific in the url params, and they are for the current
    // entity class, use them. Otherwise, clear them
    const urlFilterParams: Filters = {
      policy: urlFilterParamsPolicy,
      plan: urlFilterParamsPlan,
      challenge: urlFilterParamsChallenge,
    }[docType];

    const useUrlFilters: boolean = urlFilterParams !== null;
    const newFilters: Filters = useUrlFilters ? urlFilterParams : {};
    return newFilters;
  }, [
    docType,
    urlFilterParamsChallenge,
    urlFilterParamsPlan,
    urlFilterParamsPolicy,
  ]);

  const initFilters: Filters = getFiltersFromUrlParams();
  const [filters, setFilters] = useState<Filters>(initFilters);

  const [searchText, setSearchText] = useState<string | null>(
    initFilters._text !== undefined ? initFilters._text[0] : null
  );

  /**
   * Minimum and maximum dates defining a range.
   */
  type MinMaxDates = {
    min?: Date;
    max?: Date;
  };

  // min and max dates for date range pickers dynamically determined by data
  const [, setMinMaxStartDate] = useState<MinMaxDates>({
    min: undefined,
    max: undefined,
  });
  const [, setMinMaxEndDate] = useState<MinMaxDates>({
    min: undefined,
    max: undefined,
  });

  // define filters in groups
  // TODO make simpler, probably removing the `field` key
  const [filterDefs, setFilterDefs] = useState<FilterDefs[] | null>(
    entityInfo.filters
  );

  const [columns, setColumns] = useState<DataColumnDef[] | null>(null);

  /**
   * Arguments for `getData` which retrieves data for the Data page.
   */
  interface GetDataArgs {
    filtersForQuery: Filters;
    entityInfoForQuery: DataPageInfo;
    orderingForQuery?: [string, string][];
    getOptionSets?: boolean;
  }

  /**
   * Get data for page
   * @method getData
   */
  const getData: Function = useCallback(
    async ({
      filtersForQuery,
      entityInfoForQuery,
      orderingForQuery = ordering,
      getOptionSets = false,
    }: GetDataArgs): Promise<void> => {
      const method: string = "post";
      const initColumns: DataColumnDef[] = entityInfoForQuery.getColumns({
        metadata: {},
        setOrdering,
        placeType,
      });
      const queries: { [k: string]: Promise<any> } = {
        instances: entityInfoForQuery.dataQuery({
          method,
          filters: filtersForQuery,
          ordering: orderingForQuery,
          page: curPage,
          pagesize,
          placeType,
        }),
      };

      if (getOptionSets) {
        queries.optionsets = OptionSet({
          method: "get",
          class_name: entityInfoForQuery.nouns.s,
          fields: entityInfoForQuery.filterDefs
            .map(d => Object.values(d).map(dd => dd))
            .flat()
            .filter(d => !d.field.startsWith("date"))
            .map(d => {
              return d.entity_name + "." + d.field;
            }),
          entity_name: entityInfoForQuery.nouns.s,
        });
        queries.metadata = Metadata({
          method: "get",
          fields: initColumns.map(d => {
            const key = d.defKey || d.dataField;
            if (!key.includes("."))
              return entityInfoForQuery.nouns.s.toLowerCase() + "." + key;
            else return key;
          }),
          entity_class_name: entityInfoForQuery.nouns.s,
        });
      }

      // execute queries and collate results
      const results: {
        [k: string]: ApiResponse<any> | ApiResponseIndexed<any> | undefined;
        instances?: ApiResponse<DataRecord>;
        metadata?: ApiResponse<MetadataRecord>;
        optionsets?: ApiResponseIndexed<OptionSetRecord>;
      } = await execute({
        queries,
      });

      // set data and metadata with results
      setData(results.instances?.data || null);
      setNumInstances(
        results.instances?.n !== undefined ? results.instances.n : null
      );

      // define min/max range of daterange pickers
      // TODO modularize and reuse repeated code
      if (results.instances !== undefined) {
        const policyDatesStart = safeGetFieldValsAsStrings(
          results.instances.data,
          "date_start_effective"
        );
        const policyDatesEnd: string[] = safeGetFieldValsAsStrings(
          results.instances.data,
          "date_end_actual"
        );
        const minStartDate: string = moment(policyDatesStart[0])
          .utc()
          .format("YYYY/MM/DD");
        const maxStartDate: string = moment(
          policyDatesStart[policyDatesStart.length - 1]
        )
          .utc()
          .format("YYYY/MM/DD");
        const newMinMaxStartDate = {
          min: new Date(minStartDate),
          max: new Date(maxStartDate),
        };
        const minEndDate: string = moment(policyDatesEnd[0])
          .utc()
          .format("YYYY/MM/DD");
        const maxEndDate: string = moment(
          policyDatesEnd[policyDatesEnd.length - 1]
        )
          .utc()
          .format("YYYY/MM/DD");

        const newMinMaxEndDate = {
          min: new Date(minEndDate),
          max: new Date(maxEndDate),
        };

        setMinMaxStartDate(newMinMaxStartDate);
        setMinMaxEndDate(newMinMaxEndDate);
      }

      // if page is first initializing, also retrieve filter optionset values for
      // non-date filters
      // TODO move this out of main code if possible
      if (
        getOptionSets &&
        results.metadata !== undefined &&
        results.optionsets !== undefined
      ) {
        setMetadata(results.metadata.data);

        const optionsets: { [k: string]: OptionSetRecord[] } =
          results["optionsets"].data;

        // set options for filters
        const newFilterDefs: FilterDefs[] = [...entityInfoForQuery.filterDefs];
        newFilterDefs.forEach((filterDef: FilterDefs) => {
          for (const [filterName] of Object.entries(filterDef)) {
            if (!filterName.startsWith("date"))
              filterDef[filterName].items = optionsets[filterName];
          }
        });
        setFilterDefs(newFilterDefs);
      }
      setColumns(
        entityInfoForQuery.getColumns({
          metadata: metadata || {},
          setOrdering,
          placeType,
        })
      );
      setLoading(false);
    },
    // TODO fix dependencies
    // eslint-disable-next-line
    [curPage, ordering, pagesize, setLoading, placeType]
  );

  // EFFECT HOOKS // ---------—---------—---------—---------—---------—------//
  // on initial page load, get all data and filter optionset values
  useEffect(() => {
    // scroll to top of page
    window.scrollTo(0, 0);

    // set loading spinner to visible
    setLoading(true);

    // set current page
    setPage("data");
  }, [setLoading, setPage]);

  // when doc type changes, nullify columns / data / filter defs, then update
  // entity info
  useEffect(() => {
    setLoading(true);
    setColumns(null);
    setData(null);
    setFilterDefs(null);
    setOrdering(
      docType === "challenge"
        ? [["date_of_complaint", "desc"]]
        : [["date_start_effective", "desc"]]
    );

    // TODO review types
    const newEntityInfo: DataPageInfo = {
      policy: policyInfo as DataPageInfo,
      plan: planInfo as DataPageInfo,
      challenge: challengeInfo as DataPageInfo,
    }[docType];

    // get current URL params
    const urlParams: URLSearchParams = new URLSearchParams(
      window.location.search
    );

    // update which doc type is being viewed
    urlParams.set("type", docType);
    if (docType === "policy") urlParams.set("placeType", placeType);
    else urlParams.delete("placeType");

    const newState: Record<string, any> = {};
    // TODO confirm use of Object.entries here is valid
    for (const [paramName, paramVal] of Object.entries(urlParams)) {
      if (paramVal !== null && paramVal !== "") {
        newState[paramName] = paramVal;
      }
    }
    const newUrl = urlParams.toString() !== "" ? `/data?${urlParams}` : "/data";
    window.history.replaceState(newState, "", newUrl);

    const newFilters = getFiltersFromUrlParams();
    setFilters(newFilters);
    setSearchText(newFilters._text !== undefined ? newFilters._text[0] : null);

    // update entity info and get data
    setEntityInfo(newEntityInfo);
    getData({
      filtersForQuery: newFilters,
      orderingForQuery:
        docType === "challenge"
          ? [["date_of_complaint", "desc"]]
          : [["date_start_effective", "desc"]],
      entityInfoForQuery: newEntityInfo,
      initializingForQuery: true,
      getOptionSets: true,
    });
    // TODO fix dependencies -- adding useCallback funcs. creates inf. loop
    // eslint-disable-next-line
  }, [docType, setLoading]);

  const updateData = useCallback(() => {
    if (!loading) {
      // update data
      setLoading(true);
      getData({
        filtersForQuery: {
          ...filters,
          _text: searchText !== null ? [searchText] : [],
        },
        entityInfoForQuery: entityInfo,
        initializingForQuery: true,
      });

      // update URL params string
      // if filters are empty, clear all URL search params

      // get current URL params
      const urlParams = new URLSearchParams(window.location.search);

      // get filter strings for each doc type
      const curUrlFilterParamsPolicy = urlParams.get("filters_policy");
      const curUrlFilterParamsPlan = urlParams.get("filters_plan");
      // const curUrlFilterParamsChallenge = urlParams.get("filters_challenge");

      // get key corresponding to the currently viewed doc type's filters
      const filtersUrlParamKey = "filters_" + docType;

      // TODO make the below work with two filter sets
      // TODO create more specific types
      // Default state is the currently selected filters per the URL params
      const newState: Record<string, any> = { type: docType };
      if (curUrlFilterParamsPolicy !== null)
        newState.filters_policy = curUrlFilterParamsPolicy;
      if (curUrlFilterParamsPlan !== null)
        newState.filters_plan = curUrlFilterParamsPlan;

      if (isEmpty(filters) && searchText === null) {
        // clear filters for current doc type and update window history
        newState[filtersUrlParamKey] = "";
      } else {
        const newFiltersForState = {
          ...filters,
        };
        // add search text to new URL state if it's not null
        if (searchText !== null) {
          newFiltersForState._text = [searchText];
        } else {
          delete newFiltersForState._text;
        }
        newState[filtersUrlParamKey] = JSON.stringify(newFiltersForState);
      }
      const newUrlParams = new URLSearchParams();
      if (docType === "policy") newUrlParams.set("placeType", placeType);
      else newUrlParams.delete("placeType");
      for (const [k, v] of Object.entries(newState)) {
        if (v !== null && v !== "") {
          newUrlParams.append(k, v);
        }
      }
      const newUrl =
        newUrlParams.toString() !== "" ? `/data?${newUrlParams}` : "/data";

      window.history.replaceState(newState, "", newUrl);
    }
  }, [
    docType,
    entityInfo,
    filters,
    getData,
    loading,
    placeType,
    searchText,
    setLoading,
  ]);

  // update filters to contain latest search text
  useEffect(() => {
    // if filters already contain this search text, do nothing
    if (
      filters._text !== undefined &&
      filters._text.length > 0 &&
      filters._text[0] === searchText
    )
      return;
    else {
      // add search text to filters if it's not null or blank, otherwise delete
      // its field from the filters
      const updatedFilters: Filters = { ...filters };
      if (searchText !== null && searchText !== "") {
        updatedFilters._text = [searchText];
        setFilters(updatedFilters);
      } else if (updatedFilters._text !== undefined) {
        delete updatedFilters._text;
        setFilters(updatedFilters);
      }
    }
  }, [filters, searchText]);

  useEffect(() => {
    if (curPage !== 1) setCurPage(1);
    else updateData();
    // TODO review dependencies
    // eslint-disable-next-line
  }, [filters, pagesize]);
  // }, [filters, pagesize, searchText, placeType]);

  // when filters are updated, update data
  useEffect(() => {
    updateData();
    // TODO review dependencies -- including `updateData` causes infinite loop
    // of calls
    // eslint-disable-next-line
  }, [ordering, curPage, placeType]);

  // useEffect(() => {
  //   // update table columns if `placeType` changed and metadata ready
  //   if (metadata !== null)
  //     setColumns(
  //       entityInfo.getColumns({
  //         metadata,
  //         setOrdering,
  //         placeType,
  //       })
  //     );
  //   // TODO fix dependencies
  //   // eslint-disable-next-line
  // }, [placeType]);

  // have any filters or search text been applied?
  const areFiltersDefined = !(
    isEmpty(filters) &&
    (searchText === null || searchText === "")
  );

  const tableIsReady: boolean =
    columns !== null && data !== null && filterDefs !== null;

  return (
    <div className={styles.data}>
      <div className={styles.header}>
        <PageHeader>Data access</PageHeader>
        <div className={styles.columnText}>
          <p>
            The COVID Analysis and Mapping of Policies (AMP) site provides
            access to a comprehensive list of policies and plans implemented
            globally to address the COVID-19 pandemic.
          </p>
          <ul>
            <li>
              In many cases response efforts have been led by subnational
              governments or private and non-profit organizations.
            </li>
            <li>
              Each policy or plan has been categorized by the type of measure,
              in addition to implementation date and authorizing agency.
            </li>
            <li>
              Policies can also be identified by legal authority and plans by
              type of organization.
            </li>
            <li>
              Where available, PDFs or links to the original document or notice
              are included.{" "}
            </li>
            {
              // TODO decide whether to add Airtable link and
              // update accordingly
            }
            <li>
              Click{" "}
              <Link to={"/data?type=policy&placeType=affected"}>here</Link> to
              access the data in Airtable format.
            </li>
          </ul>
        </div>
      </div>
      {
        <>
          <Drawer
            {...{
              title: <span>Select data</span>,
              noCollapse: false,
              headerBackgroundColor: colors.mapGreen5,
              content: (
                <>
                  <section className={styles.contentTop}>
                    <RadioToggle
                      label={<ControlLabel>Search for</ControlLabel>}
                      choices={[
                        { name: "Policies", value: "policy" },
                        { name: "Plans", value: "plan" },
                        // { name: "Court challenges", value: "challenge" },
                      ]}
                      labelPos={"top"}
                      curVal={docType}
                      callback={setDocType}
                      horizontal={true}
                      selectpicker={false}
                      setInfoTooltipContent={setInfoTooltipContent}
                      theme={"slim"}
                      onClick={undefined}
                      className={undefined}
                      children={undefined}
                    />
                    {docType === "policy" && (
                      <RadioToggle
                        label={<ControlLabel>View by</ControlLabel>}
                        choices={[
                          {
                            name: "Affected location",
                            value: "affected",
                            tooltip:
                              "View all policies affecting the selected location",
                          },
                          {
                            name: "Jurisdiction",
                            value: "jurisdiction",
                            tooltip:
                              "View all policies created by the selected jurisdiction",
                          },
                        ]}
                        horizontal={true}
                        curVal={placeType}
                        callback={setPlaceType}
                        labelPos={"top"}
                        selectpicker={false}
                        setInfoTooltipContent={setInfoTooltipContent}
                        theme={"slim"}
                        tooltipMode={"footnote"}
                        onClick={undefined}
                        className={undefined}
                        children={undefined}
                      />
                    )}
                    <Search
                      searchText={searchText}
                      onChangeFunc={setSearchText}
                      {...{ loading }}
                    />
                  </section>
                  {tableIsReady && (
                    <section className={styles.filterSet}>
                      <ControlLabel>
                        {placeType === "affected"
                          ? "Affected location"
                          : "Jurisdiction"}{" "}
                        and policy details
                      </ControlLabel>
                      <FilterSet
                        alignBottom
                        vertical
                        onClearAll={() => {
                          setSearchText(null);
                          setFilters({});
                        }}
                        instanceNouns={nouns}
                        {...{
                          filterDefs,
                          filters,
                          setFilters,
                          searchText,
                          setSearchText,
                          numInstances,
                        }}
                      ></FilterSet>
                    </section>
                  )}
                </>
              ),
            }}
          />
          {DownloadBtn({
            render: tableIsReady,
            class_name: [nouns.s, "secondary"],
            classNameForApi: areFiltersDefined ? nouns.s : "All_data",
            buttonLoading,
            setButtonLoading,
            searchText,
            filters,
            disabled: data && data.length === 0,
            message: (
              <span>
                {data && data.length === 0 && (
                  <>No {nouns.p.toLowerCase()} found</>
                )}
                {data && data.length > 0 && (
                  <>
                    <span style={{ fontWeight: 700 }}>
                      Download {!areFiltersDefined ? "all" : "filtered"} data{" "}
                    </span>
                    <span style={{ fontWeight: 400 }}>
                      ({comma(numInstances)}{" "}
                      {numInstances !== 1
                        ? nouns.p.toLowerCase()
                        : nouns.s.toLowerCase().replace("_", " ")}
                      , .xlsx)
                    </span>
                  </>
                )}
              </span>
            ),
          })}
          {tableIsReady && (
            <Table
              showDefinitions={Settings.SHOW_TABLE_DEFINITIONS}
              key={
                (columns !== null ? columns.map(c => c.header) : placeType) +
                entityInfo.nouns.s +
                placeType
              }
              {...{
                nTotalRecords: numInstances,
                curPage,
                setCurPage,
                pagesize,
                columns: columns !== null ? columns : [],
                data: data !== null ? data : [],
                defaultSortedField: entityInfo.defaultSortedField,
                className: styles[entityInfo.nouns.s.toLowerCase()],
                setPagesize,
              }}
            />
          )}
          {!tableIsReady && <div style={{ height: "900px" }} />}
        </>
      }
    </div>
  );
};

export default Data;

/**
 * Returns the place type defined in the URL parameters, or null if none.
 * @returns {PlaceType | null} The place type defined in the URL parameters, or
 * null if none.
 */
function getParamsPlaceType(): PlaceType | null {
  // get URL search parameters
  const params: URLSearchParams = new URLSearchParams(
    window !== undefined ? window.location.search : ""
  );

  const placeTypeTmp: string | null = params.get("placeType");
  if (placeTypeTmp !== null) {
    if (validPlaceTypes.includes(placeTypeTmp as PlaceType)) {
      return placeTypeTmp as PlaceType;
    } else {
      throw Error(
        "Invalid place type provided as URL param, must be one of " +
          validPlaceTypes.join(", ") +
          "; but found: " +
          placeTypeTmp
      );
    }
  } else return null;
}
