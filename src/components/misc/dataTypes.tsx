/**
 * Record describing a place from the AMP database.
 */
export type PlaceRecord = {
  id?: number;
  level?: string;
  loc?: string;
  country_name?: string;
  iso3?: string;
  area1?: string;
  area2?: string;
  dillons_rule?: "Yes" | "No" | null;
  home_rule?: "Yes" | "No" | null;
};

export type AuthEntityRecord = {
  id?: number;
  name?: string;
  office?: string;
  official?: string;
  place?: PlaceRecord;
};

/**
 * A policy record returned from the AMP API defining metadata for a
 * given policy.
 */
export type PolicyRecord = {
  id?: number;
  place?: PlaceRecord[];
  auth_entity?: AuthEntityRecord[];
  primary_ph_measure?: string;
  authority_name?: string;
  name_and_desc?: string;
  date_start_effective?: string | null;
  date_end_actual?: string | null;
  file?: any;
  policy_name?: string;
};

/**
 * A plan record returned from the AMP API defining metadata for a
 * given plan.
 */
export type PlanRecord = {
  id?: number;
  source_id?: string;
  name?: string;
  org_type?: string;
  org_name?: string;
  name_and_desc?: string;
  date_issued?: string | null | null;
  primary_loc?: string;
  place?: any;
  file?: any;
};

/**
 * A court challenge record returned from the AMP API defining metadata for a
 * given court challenge.
 */
export type CourtChallengeRecord = {
  id?: number;
  matter_numbers?: string;
  case_name?: string;
  case_number?: string;
  court?: string;
  jurisdiction?: string;
  filed_in_state_or_federal_court?: string;
  government_order_upheld_or_enjoined?: string;
  policy_or_law_name?: string;
  date_of_complaint?: string | null;
  date_of_decision?: string | null;
  data_source_for_complaint?: string;
  data_source_for_decision?: string;
  holding?: string;
  legal_citation?: string;
  summary_of_action?: string | null;
  parties?: string;
  policy_status?: string;
  case_status?: string;
};

/**
 * Set of data records for display in the data page.
 */
export type DataRecords<
  T extends PolicyRecord | PlanRecord | CourtChallengeRecord
> = T[];
export type DataRecord = (PolicyRecord | PlanRecord | CourtChallengeRecord) & {
  date_start_effective?: string | null;
  date_end_actual?: string | null;
};

/**
 * A record returned from the AMP API describing metadata for a data field.
 */
export type MetadataRecord = {
  field?: string;
  table_name?: string;
  ingest_field?: string;
  order?: number;
  display_name?: string;
  colgroup?: string;
  definition?: string;
  tooltip?: string;
  possible_values?: string;
  entity_name?: string;
  export?: boolean;
  class_name?: string;
};
