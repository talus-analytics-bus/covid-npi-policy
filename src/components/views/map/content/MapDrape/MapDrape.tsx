import { MapId } from "components/common/MapboxMap/plugins/mapTypes";
import InfoTooltip from "components/misc/InfoTooltip";
import moment, { Moment } from "moment";
import React, { FC } from "react";
import styles from "./MapDrape.module.scss";
interface MapDrapeProps {
  mapTitle: string;
  date: Moment;
  overallUpdateDate: Moment;
  versions: any[];
  mapId: MapId;
  setInfoTooltipContent(arg: any): void;
}
export const MapDrape: FC<MapDrapeProps> = ({
  mapId,
  mapTitle,
  date,
  overallUpdateDate,
  versions,
  setInfoTooltipContent,
}) => {
  return (
    <div className={styles.mapDrape}>
      <div className={styles.mapBanner}>
        <div className={styles.title}>{mapTitle}</div>
        <div className={styles.dates}>
          <div className={styles.primary}>
            Data for {date.format("MMM D, YYYY")}
          </div>
          <div className={styles.secondary}>
            Data last updated on {overallUpdateDate.format("MMM D, YYYY")}
            <InfoTooltip
              place={"left"}
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
