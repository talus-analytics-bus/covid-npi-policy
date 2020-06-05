/**
 * Date slider picker with play/pause buttons and a calendar datepicker.
 */

// standard packages
import React, { useEffect, useState, useRef } from "react";
import styles from "./dateslider.module.scss";

// common components
import { FloatMenu } from "..";

// 3rd party packages
import moment from "moment";
import Slider from "rc-slider";
import classNames from "classnames";
import { Calendar } from "react-date-range";

// assets
import calendarSvg from "./assets/calendarGray.svg";
import calendarSelectedSvg from "./assets/calendarBlue.svg";

// 3rd party styles
import "rc-slider/assets/index.css";
import "rc-tooltip/assets/bootstrap.css";

// FUNCTION COMPONENT // ----------------------------------------------------//
const DateSlider = ({ label, date, setDate, minDate, maxDate, ...props }) => {
  // define playing state
  const [playing, setPlaying] = useState(false);
  const [playTimeouts, setPlayTimeouts] = useState([]);

  // define min/max slider values (moment objects)
  const sliderMin = new moment(minDate);
  const sliderMax = new moment(maxDate);

  // define current slider value in units of number of days since min value
  const [curSliderVal, setCurSliderVal] = useState(
    date.diff(sliderMin, "days")
  );
  const [curSliderDate, setCurSliderDate] = useState(date);

  // CONSTANTS // -----------------------------------------------------------//

  // slider min is always zero (relative to sliderMin date) and max is number
  // of days sliderMax is after sliderMin
  const sliderMinValue = 0;
  const sliderMaxValue = sliderMax.diff(sliderMin, "days");

  // EFFECT HOOKS // --------------------------------------------------------//
  // when slider date changes, update all data
  useEffect(() => {
    setDate(curSliderDate);
  }, [curSliderDate]);

  // date slider and styles
  // wrapper style: optional
  const wrapperStyle = {};

  // define height and width of slider
  // height is also used for rail and track
  const height = 12;
  const width = 12;
  const railStyle = { backgroundColor: "transparent", height: height + "px" };
  const trackStyle = { backgroundColor: "transparent", height: height + "px" };

  // define handle style
  const handleStyle = {
    backgroundColor: "#0e223f",
    borderColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    width: width + "px",
    height: height + "px",
    display: "flex",
    justifyContent: "center",
    top: "4px"
  };
  const dotStyle = {
    // borderColor: "#96dbfa"
  };

  // define handle for slider
  const Handle = Slider.Handle;
  const handle = propsHandle => {
    const { value, dragging, index, ...restProps } = propsHandle;

    const unit = (height - 3) / 3;

    const grooveYs = [0, 1, 2].map((d, i) => unit / 2 + unit * i);
    return (
      <Handle data-tip={true} data-for={"sliderTooltip"} {...restProps}>
        {
          <div className={styles.dateLabel}>
            {curSliderDate.format("MMM D")}
          </div>
        }
        <svg height={height} width={15} className={styles.grooves}>
          {grooveYs.map(d => (
            <line {...{ key: d, x1: 3, y1: d + 1, x2: width - 3, y2: d + 1 }} />
          ))}
        </svg>
      </Handle>
    );
  };

  // UTILITY FUNCTIONS // ---------------------------------------------------//

  /**
   * Handle behavior when slider value is changed
   * @method handleSliderChange
   * @param  {[type]}           valNumeric [description]
   * @return {[type]}                      [description]
   */
  const handleSliderChange = valNumeric => {
    // update slider numeric value and date based on latest numeric value
    // on slider
    setCurSliderVal(valNumeric);
    const newCurSliderDate = moment(sliderMin);
    newCurSliderDate.add(valNumeric, "days");
    setCurSliderDate(newCurSliderDate);
  };

  /**
   * Handle play behavior
   * @method handlePlay
   * @return {[type]}   [description]
   */
  const handlePlay = () => {
    // set playing to true
    setPlaying(true);

    // iterate over each value on the slider until the end, pushing a timeout
    // event that triggers the slider movement
    let prev = curSliderVal;
    let i = 0;
    let cur;
    const newPlayTimeouts = [];
    while (prev < sliderMaxValue) {
      cur = prev + 1;
      prev = cur;
      const timeoutPrev = prev;

      newPlayTimeouts.push(
        setTimeout(() => {
          if (timeoutPrev >= sliderMax) {
            setPlaying(false);
          }
          // update dates, etc.
          handleSliderChange(timeoutPrev);
          setCurSliderVal(timeoutPrev);
        }, 1320 * i)
      );
      i = i + 1;
    }
    setPlayTimeouts(newPlayTimeouts);
  };

  /**
   * Stop playing after playing after slider is changed
   * @method handleSliderAfterChange
   * @return {[type]}                [description]
   */
  const handleSliderAfterChange = () => {
    // Stop playing if playing
    if (playing) handlePause();
  };

  /**
   * If paused, stop playing and clear all playing timeouts (events that
   * move the slider along the track)
   * @method handlePause
   * @return {[type]}    [description]
   */
  const handlePause = () => {
    setPlaying(false);
    while (playTimeouts.length > 0) {
      clearTimeout(playTimeouts.pop());
    }
    setPlayTimeouts([]);
  };

  /**
   * If press fast forward or rewind, stop playing and increment or decrement
   * slider value as appropriate
   * @method handleBackForward
   * @param  {[type]}          change [description]
   * @return {[type]}                 [description]
   */
  const handleBackForward = change => {
    // Stop playing if playing
    if (playing) handlePause();

    // Update slider value by incrementing or decrementing as appropriate
    const newSliderVal = curSliderVal + change;
    if (newSliderVal < sliderMinValue || newSliderVal > sliderMaxValue) return;
    handleSliderChange(newSliderVal);
  };

  /**
   * Get marks to label on slider track
   * If less than a month is encompassed by the track, list start and end days.
   * Otherwise, show months on the track.
   * @method getMarks
   * @return {[type]} [description]
   */
  const getMarks = () => {
    if (sliderMaxValue - sliderMinValue < 29) {
      // return start and end date as the marks
      return {
        [sliderMinValue]: sliderMin.format("MMM D, YYYY"),
        [sliderMaxValue]: sliderMax.format("MMM D, YYYY")
      };
    } else {
      const marks = {};
      // return first of each month as the marks
      let curDate = moment(sliderMin);
      const markMax = moment(sliderMax).endOf("month");
      while (curDate < markMax) {
        const valNumeric = curDate.diff(sliderMin, "days");
        marks[valNumeric] = curDate.format("MMM 'YY");
        curDate.add(1, "months").startOf("month");
      }
      // if more than 5 marks, only keep half
      const nMarks = Object.values(marks).length;
      if (nMarks > 5) {
        let thresh;
        if (nMarks > 10) {
          thresh = 3;
        } else if (nMarks > 5) {
          thresh = 2;
        }
        let i = 0;

        for (const [k] of Object.entries(marks)) {
          if (i % thresh > 0) delete marks[k];
          i++;
        }
      }
      return marks;
    }
  };

  // JSX // -----------------------------------------------------------------//
  return (
    <div className={styles.dateSlider} style={wrapperStyle}>
      {
        // label, e.g., "Date"
      }
      <div className={styles.label}>{label}</div>
      {
        // main content of slider component
      }
      <div className={styles.content}>
        {
          // bar
        }
        <div className={styles.sliderBar}>
          <Slider
            min={sliderMinValue}
            max={sliderMaxValue}
            defaultValue={sliderMaxValue}
            value={curSliderVal}
            marks={getMarks()}
            step={1}
            handle={handle}
            railStyle={railStyle}
            trackStyle={trackStyle}
            handleStyle={handleStyle}
            dotStyle={dotStyle}
            onChange={handleSliderChange}
            onAfterChange={handleSliderAfterChange}
          />
        </div>
        {
          // play, pause, ffwd, rewind
        }
        <div className={styles.sliderControls}>
          {
            <i
              onClick={() => handleBackForward(-1)}
              className={classNames("material-icons", {
                [styles.disabled]: curSliderVal <= sliderMin
              })}
            >
              fast_rewind
            </i>
          }
          {// Show play button if not playing, pause button otherwise
          !playing ? (
            <i
              onClick={handlePlay}
              className={classNames("material-icons", {
                [styles.disabled]: curSliderVal >= sliderMax
              })}
            >
              play_arrow
            </i>
          ) : (
            <i onClick={handlePause} className={classNames("material-icons")}>
              pause
            </i>
          )}
          {
            <i
              onClick={() => handleBackForward(+1)}
              className={classNames("material-icons", {
                [styles.disabled]: curSliderVal >= sliderMax
              })}
            >
              fast_forward
            </i>
          }
        </div>
      </div>
      {
        // calendar datepicker
      }
      <FloatMenu
        {...{
          control: open => (
            <div
              className={classNames(styles.calendarPicker, {
                [styles.open]: open
              })}
            >
              <button>{date.format("MMM D, 'YY")}</button>{" "}
              <img src={open ? calendarSelectedSvg : calendarSvg} />
            </div>
          )
        }}
      >
        <Calendar
          date={new Date(date)}
          minDate={new Date(moment(minDate).utc())}
          maxDate={new Date(moment(maxDate).utc())}
          onChange={v => {
            // when calendar date changes, update the dateslider date and the
            // app date, and pause playback if it's playing
            const vMoment = moment(v);
            const newSliderVal = vMoment.diff(sliderMin, "days");
            setCurSliderVal(newSliderVal);
            handleSliderChange(newSliderVal);
            if (playing) handlePause();
          }}
        />
      </FloatMenu>
    </div>
  );
};

export default DateSlider;
