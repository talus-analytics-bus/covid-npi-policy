import { parseStringAsMoment } from "src/components/misc/UtilsTyped";
import moment from "moment";
import { NumericObservation } from "../MapboxMap/plugins/mapTypes";

/**
 * Returns the value from a data series occurring on the defined data date,
 * if any.
 * @param data Array of observation data
 * @param date The date of the data of interest
 * @returns The value of data on the data date.
 */
export function getDatumByDate(
  data: NumericObservation[],
  date: moment.Moment
): NumericObservation | undefined {
  return data.find(d => {
    return parseStringAsMoment(d.date_time)
      .utc()
      .isSame(date, "date");
  });
}
