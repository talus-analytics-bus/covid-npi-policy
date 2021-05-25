import {
  CaseloadQueryArgs,
  CountryFeature,
  CountyFeature,
  MapFeature,
  MapId,
  Observation,
  StateFeature,
} from "components/common/MapboxMap/plugins/mapTypes";
import { Caseload } from "components/misc/Queries";
import { Moment } from "moment";

export async function updateData(
  mapId: MapId,
  feature: MapFeature,
  dataDate: Moment,
  setData: Function,
  setReady: Function
) {
  const baseParams: CaseloadQueryArgs = {
    windowSizeDays: 7,
    fields: ["date_time", "value"],
    countryId: undefined,
    countryIso3: undefined,
    ansiFips: undefined,
    stateId: undefined,
    getAverage: true,
  };
  setLocationParam(baseParams, mapId, feature);
  const newData = await Caseload(baseParams as any);
  setData(newData);
  setReady(true);
}
function setLocationParam(
  baseParams: CaseloadQueryArgs,
  mapId: string,
  feature: MapFeature
) {
  switch (mapId) {
    case "us":
      baseParams.stateName = (feature as StateFeature).properties.state_name;
      break;
    case "us-county":
      baseParams.ansiFips = (feature as CountyFeature).id;
      break;
    case "global":
    default:
      baseParams.countryIso3 = (feature as CountryFeature).properties.ISO_A3;
      break;
  }
}
