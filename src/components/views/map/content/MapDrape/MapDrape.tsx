import { MapId } from "components/common/MapboxMap/plugins/mapTypes";
import { InfoTooltip } from "components/common";
import moment, { Moment } from "moment";
import { FC } from "react";
import styles from "./MapDrape.module.scss";
import { formatLocalDate } from "components/misc/FormatAndDisplay/FormatAndDisplay";
interface MapDrapeProps {
  mapTitle: string;
  date: Moment;
  overallUpdateDate: Moment;
  versions: any[];
  mapId: MapId;
  setInfoTooltipContent(arg: any): void;
  casesUpdatedMoment: Moment;
}
export const MapDrape: FC<MapDrapeProps> = ({
  mapId,
  mapTitle,
  date,
  overallUpdateDate,
  versions,
  setInfoTooltipContent,
  casesUpdatedMoment,
}) => {
  const caseloadDataDate: Moment =
    casesUpdatedMoment < date ? casesUpdatedMoment : date;
  return (
    <div className={styles.mapDrape}>
      <div className={styles.mapBanner}>
        <div className={styles.title}>{mapTitle}</div>
        <div className={styles.dates}>
          <div className={styles.primary}>
            Policy data showing for {formatLocalDate(date)}
          </div>
          <div style={{ color: "red" }} className={styles.primary}>
            Caseload data showing for {formatLocalDate(caseloadDataDate)}
          </div>
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
