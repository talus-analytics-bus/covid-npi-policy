import {
  FC,
  Dispatch,
  SetStateAction,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import moment from "moment";
import { Helmet } from "react-helmet";
import {
  StringParam,
  JsonParam,
  withDefault,
  useQueryParams,
} from "use-query-params";

// common components and functions
import Search from "../../common/Table/content/Search/Search";
import { FilterSet, Table, RadioToggle, InfoTooltip } from "../../common";
import { PageHeader } from "components/project";
import Drawer from "../../layout/drawer/Drawer";
import { Metadata, OptionSet, execute } from "api/Queries";
import { comma } from "../../misc/Util.js";
import { isEmpty } from "components/misc/UtilsTyped";
import {
  getClassNameForApi,
  safeGetFieldValsAsStrings,
} from "./content/helpers";
import { ControlLabel } from "components/common/OptionControls";
import {
  DataPageType,
  DocTypeParam,
  FilterType,
  PlaceTypeParam,
} from "./types";

// styles and assets
import styles from "./data.module.scss";
import colors from "assets/styles/vars.module.scss";

// constants, types, etc.
import Settings from "Settings";
import policyInfo from "./content/policy";
import planInfo from "./content/plan";
import challengeInfo from "./content/challenge.js";
import {
  FilterDefs,
  Filters,
} from "components/common/MapboxMap/plugins/mapTypes";
import { DataPageInfo } from "./content/types";
import { ApiResponse, ApiResponseIndexed } from "api/responseTypes";
import { DataRecord, MetadataRecord } from "components/misc/dataTypes";
import { OptionSetRecord } from "api/queryTypes";
import { DataColumnDef, Pagesize } from "components/common/Table/Table";
import { AmpPage } from "types";
import styled from "styled-components";
import DataDownloadBtn from "components/project/DownloadBtn/DataDownloadBtn";

const DownloadButtons = styled.div`
  display: flex;
  flex-flow: row;
  gap: 0 20px;
  justify-content: end;
  margin: 1rem 0;
`;

const InfoTooltipContent = styled.div`
  text-align: left;
  font-weight: normal;
  font-size: 1rem;
`;

/**
 * Minimum and maximum dates defining a range.
 */
type MinMaxDates = {
  min?: Date;
  max?: Date;
};

/**
 * Properties for Data function component.
 */
interface DataProps {
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
  setInfoTooltipContent: Dispatch<SetStateAction<string | null>>;

  /**
   * Sets the current page.
   */
  setPage: Dispatch<SetStateAction<AmpPage | null>>;

  /**
   * The type, i.e., mode, of the data page, that determines what kind of data
   * are being displayed.
   */
  type: DataPageType;

  /**
   * Optional: A string representing where the user was routed to Data from
   *
   * This is currently only used to trigger a rerender when the Omicron banner
   * interaction takes the user to Data
   */
  routedFrom: string;
}

/**
 * Primary data viewing and download page for COVID AMP.
 * @param param0 Properties
 * @returns Function component
 */
const Data: FC<DataProps> = ({
  loading,
  setLoading,
  setInfoTooltipContent,
  setPage,
}) => {
  // Note: The `type` and `placeType` query params have built-in defaults,
  // see their definitions. `withDefault` is not used for them because the
  // library does not support robust defaults for custom types.
  const [query, setQuery] = useQueryParams({
    type: DocTypeParam,
    placeType: PlaceTypeParam,
    filters_policy: withDefault(JsonParam, {}),
    filters_plan: withDefault(JsonParam, {}),
    searchText: withDefault(StringParam, null),
    // filters_challenge: withDefault(JsonParam, {}),
  });

  const { placeType } = query;

  const filters = useMemo(
    () => query[("filters_" + query.type) as FilterType],
    [query]
  );
  const setFilters = useCallback(
    (v: any) => {
      setQuery({ ["filters_" + query.type]: v });
    },
    [query.type, setQuery]
  );
  const setSearchText = useCallback(
    (v: any) => {
      setQuery({ searchText: v });
    },
    [setQuery]
  );
  const setPlaceType = useCallback(
    (v: any) => {
      setQuery({ placeType: v });
    },
    [setQuery]
  );

  // track the type of place being viewed in the data table policies: the
  // place the policy "affected", or the "jurisdiction" that made the policy

  const entityInfo: DataPageInfo = useMemo(() => {
    return {
      policy: policyInfo as DataPageInfo,
      plan: planInfo as DataPageInfo,
      challenge: challengeInfo as DataPageInfo,
    }[query.type];
  }, [query.type]);

  // track table pagination-relevant variables including current page, number
  // of instances (rows) in table, the ordering settings, and page size
  const [curPage, setCurPage] = useState<number>(1);
  const [pagesize, setPagesize] = useState<Pagesize>(5);
  const [numInstances, setNumInstances] = useState<number | null>(null);
  const [ordering, setOrdering] = useState<[string, string][]>(
    query.type === "challenge"
      ? [["date_of_complaint", "desc"]]
      : [["date_start_effective", "desc"]]
  );

  // track whether the download button is currently in a loading state
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [buttonLoadingSummary, setButtonLoadingSummary] = useState<boolean>(
    false
  );

  // CONSTANTS // ---------------------------------------------------------- //
  // define nouns used to refer to entity type viewed in table
  const nouns = entityInfo.nouns || { s: "Policy", p: "Policies" };

  // define data and metadata for table
  const [data, setData] = useState<DataRecord[] | null>(null);
  const [metadata, setMetadata] = useState<MetadataRecord[] | null>(null);
  const [showAdvanced] = useState(false);

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
   * Properties for `getData` which retrieves data for the Data page.
   */
  interface GetDataProps {
    filtersForQuery: Filters;
    entityInfoForQuery: DataPageInfo;
    orderingForQuery?: [string, string][];
    getOptionSets?: boolean;
  }

  /**
   * Get data for page.
   */
  const getData: Function = useCallback(
    /**
     * Get data for page.
     * @param param0 Properties
     */
    async ({
      filtersForQuery,
      entityInfoForQuery,
      orderingForQuery,
      getOptionSets = false,
    }: GetDataProps): Promise<void> => {
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
          optimized: true,
        });
        if (Settings.SHOW_TABLE_DEFINITIONS)
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

      // if applicable, update metadata
      if (results.metadata !== undefined) setMetadata(results.metadata.data);

      // if page is first initializing, also retrieve filter optionset values for
      // non-date filters
      // TODO move this out of main code if possible
      if (getOptionSets && results.optionsets !== undefined) {
        const optionsets: { [k: string]: OptionSetRecord[] } =
          results["optionsets"].data;

        // update certain values for aesthetics
        if (optionsets.country_name !== undefined) {
          const global:
            | OptionSetRecord
            | undefined = optionsets.country_name.find(o =>
            o.value.startsWith("Global")
          );
          if (global) {
            global.label = "Global";
          }
        }
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
    [placeType, curPage, pagesize, metadata, setLoading]
    // [ordering]
    // [ordering, placeType, curPage, pagesize, metadata, setLoading]
  );

  /**
   * Update data in page and URL params.
   */
  const updateData = useCallback(() => {
    // update data
    setLoading(true);
    getData({
      orderingForQuery: ordering,
      getOptionSets: true,
      filtersForQuery: {
        ...filters,
        _text: query.searchText !== null ? [query.searchText] : [],
      },
      entityInfoForQuery: entityInfo,
    });
  }, [entityInfo, filters, getData, ordering, query.searchText, setLoading]);

  // update filters to contain latest search text
  useEffect(() => {
    // if filters already contain this search text, do nothing
    if (
      filters._text !== undefined &&
      filters._text.length > 0 &&
      filters._text[0] === query.searchText
    )
      return;
    else {
      // add search text to filters if it's not null or blank, otherwise delete
      // its field from the filters
      const updatedFilters: Filters = { ...filters };
      if (query.searchText !== null && query.searchText !== "") {
        updatedFilters._text = [query.searchText];
        setFilters(updatedFilters);
      } else if (updatedFilters._text !== undefined) {
        delete updatedFilters._text;
        setFilters(updatedFilters);
      }
    }
  }, [filters, query.searchText, setFilters]);

  useEffect(() => {
    setPage("data");
  }, []);

  useEffect(() => {
    updateData();
  }, [updateData]);

  // have any filters or search text been applied?
  const filtersAreDefined = !(
    isEmpty(filters) &&
    (query.searchText === null || query.searchText === "")
  );

  const tableIsReady: boolean =
    columns !== null && data !== null && filterDefs !== null;

  // grid template areas that always apply to the drawer content
  const defaultGridTemplateAreas = `
      "top top top top"
      "sep sep sep sep"
      "filter filter filter filter"
    `;

  return (
    <div className={styles.data}>
      <Helmet>
        <title>Data</title>
        <meta name="Access COVID AMP data" />
      </Helmet>
      <div className={styles.header}>
        <PageHeader>Data access</PageHeader>
        <div className={styles.columnText}>
          <p>
            Contact us at{" "}
            <a
              href="mailto:info@talusanalytics.com"
              target="_blank"
              rel="noreferrer"
            >
              info@talusanalytics.com
            </a>{" "}
            for complete or automated access to the data.
          </p>
        </div>
      </div>
      {
        <div>
          <Drawer
            contentStyle={{
              gridTemplateAreas: `${defaultGridTemplateAreas}
      ${filtersAreDefined ? '"selected selected selected selected"' : ""}`,
            }}
            {...{
              title: <span>Select data</span>,
              noCollapse: false,
              headerBackgroundColor: colors.mapGreen5,
              content: (
                <>
                  <>
                    <RadioToggle
                      label={<ControlLabel>Choose</ControlLabel>}
                      choices={[
                        { name: "Policies", value: "policy" },
                        { name: "Plans", value: "plan" },
                        // { name: "Court challenges", value: "challenge" },
                      ]}
                      labelPos={"top"}
                      curVal={query.type}
                      callback={(v: DataPageType) => {
                        setQuery(prev => {
                          if (prev.type !== v) setData(null);
                          return { type: v };
                        });
                      }}
                      horizontal={true}
                      selectpicker={false}
                      theme={"slim"}
                      onClick={undefined}
                      className={undefined}
                      children={undefined}
                      {...{ setInfoTooltipContent }}
                    />
                    {query.type === "policy" && (
                      <RadioToggle
                        horizontal
                        selectpicker={false}
                        label={
                          <ControlLabel>
                            View by
                            <InfoTooltip
                              id={"locationTypeTooltip"}
                              iconSize={14}
                              text={
                                <>
                                  <p>
                                    When <em>"Affected location"</em> is
                                    selected, the locations listed are those
                                    where the policy applies.
                                  </p>
                                  <p>
                                    When <em>"Jurisdiction"</em> is selected,
                                    the locations listed refer to jurisdictions
                                    that authorized the policy.
                                  </p>
                                </>
                              }
                              style={{ maxWidth: "18em" }}
                              {...{ setInfoTooltipContent }}
                            />
                          </ControlLabel>
                        }
                        choices={[
                          {
                            name: "Affected location",
                            value: "affected",
                          },
                          {
                            name: "Jurisdiction",
                            value: "jurisdiction",
                          },
                        ]}
                        curVal={placeType}
                        callback={setPlaceType}
                        labelPos={"top"}
                        setInfoTooltipContent={setInfoTooltipContent}
                        theme={"slim"}
                        onClick={undefined}
                        className={undefined}
                        children={undefined}
                      />
                    )}
                    <Search
                      searchText={query.searchText}
                      onChangeFunc={setSearchText}
                      {...{ loading }}
                    />
                  </>
                  {tableIsReady && (
                    <>
                      <hr />
                      <FilterSet
                        alignBottom
                        vertical
                        customLayout
                        onClearAll={() => {
                          setSearchText(null);
                          setFilters({});
                        }}
                        instanceNouns={nouns}
                        toHide={showAdvanced ? [] : ["level"]}
                        {...{
                          filterDefs,
                          filters,
                          setFilters,
                          searchText: query.searchText,
                          setSearchText,
                          numInstances,
                        }}
                      ></FilterSet>
                    </>
                  )}
                </>
              ),
            }}
          />
          {/* TODO Refactor the DownloadBtn below */}
          <DownloadButtons>
            {nouns.s === "Policy" && (
              <DataDownloadBtn
                class_name={[nouns.s]}
                classNameForApi={getClassNameForApi(filtersAreDefined, nouns)}
                message={
                  <span>
                    {data && data.length === 0 && (
                      <>No {nouns.p.toLowerCase()} found</>
                    )}
                    {data && data.length > 0 && (
                      <>
                        <span style={{ fontWeight: 700 }}>
                          Download{!filtersAreDefined ? "" : ""} summary table{" "}
                        </span>
                        <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                          ({comma(numInstances)}{" "}
                          {numInstances !== 1
                            ? nouns.p.toLowerCase()
                            : nouns.s.toLowerCase().replace("_", " ")}{" "}
                          .xlsx)
                        </span>
                      </>
                    )}
                  </span>
                }
                {...{
                  buttonLoading,
                  setButtonLoading,
                  tableIsReady,
                  query,
                  filters,
                  data,
                }}
              />
            )}
            {
              <DataDownloadBtn
                class_name={[nouns.s].concat(
                  nouns.s === "Policy" ? ["secondary"] : []
                )}
                classNameForApi={filtersAreDefined ? nouns.s : "All_data"}
                message={
                  <span>
                    <span style={{ fontWeight: 700 }}>
                      Download all columns{" "}
                      {(numInstances ?? 0) > 0 && (
                        <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                          ({comma(numInstances)}{" "}
                          {numInstances !== 1
                            ? nouns.p.toLowerCase()
                            : nouns.s.toLowerCase().replace("_", " ")}{" "}
                          .xlsx)
                        </span>
                      )}
                      {nouns.s === "Policy" && (
                        <InfoTooltip
                          id={"DownloadInfo"}
                          iconSize={14}
                          text={
                            <InfoTooltipContent>
                              Click this button to download all available data
                              columns, including several omitted from the
                              summary table below.
                            </InfoTooltipContent>
                          }
                        />
                      )}
                    </span>
                  </span>
                }
                buttonLoading={buttonLoadingSummary}
                setButtonLoading={setButtonLoadingSummary}
                {...{ tableIsReady, query, filters, data }}
              />
            }
          </DownloadButtons>
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
        </div>
      }
    </div>
  );
};

export default Data;
