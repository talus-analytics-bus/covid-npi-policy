import {
  MapDataShapeId,
  MapId,
} from "components/common/MapboxMap/plugins/mapTypes";
import { InfoTooltip } from "components/common";
import moment, { Moment } from "moment";
import { FC } from "react";
import styles from "./MapDrape.module.scss";
import { formatLocalDate } from "components/misc/FormatAndDisplay/FormatAndDisplay";
import styled from "styled-components";
import * as colorsTmp from "../../../../../assets/styles/vars.module.scss";
const colors: any = colorsTmp as any;

const DataDate = styled.span`
  font-weight: bold;
  font-size: 1.1em;
  font-weight: bold;
  color: ${colors.orange};
`;

const SecondaryDataDate = styled(DataDate)`
  color: ${colors.orange};
  /* color: ${({ color }) => (color ? color : "#333")}; */
  /* font-weight: normal; */
  font-size: .9em;
  /* font-style: italic; */
`;
interface MapDrapeProps {
  mapTitle: string;
  date: Moment;
  overallUpdateDate: Moment;
  versions: any[];
  mapId: MapId;
  setInfoTooltipContent(arg: any): void;
  casesUpdatedMoment: Moment;
  circle: MapDataShapeId;
}
export const MapDrape: FC<MapDrapeProps> = ({
  mapId,
  mapTitle,
  date,
  overallUpdateDate,
  versions,
  setInfoTooltipContent,
  casesUpdatedMoment,
  circle,
}) => {
  const caseloadDataDate: Moment =
    casesUpdatedMoment < date ? casesUpdatedMoment : date;
  return (
    <div className={styles.mapDrape}>
      <div className={styles.mapBanner}>
        <div className={styles.title}>{mapTitle}</div>
        <div className={styles.dates}>
          <span>
            <SecondaryDataDate>
              Policy data for {formatLocalDate(date)}
            </SecondaryDataDate>

            {circle && (
              <SecondaryDataDate
              // color={date !== caseloadDataDate ? "red" : "#333"}
              >
                , caseload data for {formatLocalDate(caseloadDataDate)}
              </SecondaryDataDate>
            )}
          </span>
          <div className={styles.secondary}>
            Data last updated on {overallUpdateDate.format("MMM D, YYYY")}
            <InfoTooltip
              id={"drape-tooltip"}
              place={"left"}
              style={{ maxWidth: "300px" }}
              text={
                <div>
                  {versions
                    .filter(
                      d =>
                        d.map_types.includes(mapId) ||
                        d.map_types.includes("all")
                    )
                    .map(d => (
                      <p key={d.name}>
                        <b>{d.name}</b> last updated on{" "}
                        {moment(d.date).format("MMM D, YYYY")}
                        {d.last_datum_date !== null && (
                          <span>
                            {" "}
                            with data available through{" "}
                            {moment(d.last_datum_date).format("MMM D, YYYY")}
                          </span>
                        )}
                      </p>
                    ))}
                </div>
              }
              setInfoTooltipContent={setInfoTooltipContent}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default MapDrape;
