// Take an array of models, one per state, and
// split them into curves for each column and source

// Structure:

// {
//   'state': {
//     dateRange: {min: min, max: max},
//    [`${source}_yMax`]: 1235,
//     curves: {
//       'curve name': {
//        [`${source}_yMax`]: 12345,
//         actuals: [{x: x, y: y}],
//         model: [{x: x, y: y}],
//       },
//     },
//   },
// }

const INITIAL_R_0 = 2.524;

// take a model run string and
// parse it, including fixing dates
const parseModelString = modelRun => {
  const modelRunParsed = JSON.parse(modelRun).map(day => ({
    ...day,
    date: new Date(day.date),
  }));

  return modelRunParsed;
};

export default function parseModelCurves(
  models,
  selectedCurves,
  counterfactualSelected
) {
  const curves = {};

  models.forEach(model => {
    const state = model.state;
    // console.log(state)
    // console.log(model);

    // create state object
    curves[state] = {
      dateRange: [],
      yMax: 0,
      curves: {},
      interventions: model.interventions.filter(inter => {
        // format intervention names to use hyphens, for consistency with rest of
        // AMP site and with COVID-Local site
        inter.name = inter.name.replace(" at ", "-at-");

        // only return currently supported intervention types
        return (inter.name !== "do_nothing") & (inter.name !== "mobility_drop");
      }),
      deaths: model.actual_deaths,
      death_date: model.death_date,
      cases: model.cases,
      date: model.date,
      population: model.population,
      counterfactual_cases: model.counterfactual_cases,
      counterfactual_deaths: model.counterfactual_deaths,
    };

    const modelRun = parseModelString(
      model.results.filter(run => Object.keys(run)[0] !== run).slice(-1)[0].run
    );

    const counterfactualRun = parseModelString(
      model.results
        .filter(run => Object.keys(run)[0] !== run)
        .find(inter => inter.name.includes("mobility_drop")).run
    );

    const trimmedData = modelRun;
    // console.log(trimmedData)

    // initial r_0 for the percentage change calc
    // const initialR_0 = trimmedData[0]["R effective"];
    const initialR_0 = INITIAL_R_0;

    // create basic structure
    curves[state].curves["pctChange"] = {};
    curves[state].curves.pctChange["actuals"] = [];
    curves[state].curves.pctChange["model"] = [];
    curves[state].curves.pctChange[`actuals_yMax`] = 0;
    curves[state].curves.pctChange[`model_yMax`] = 0;

    Object.keys(trimmedData[0]).forEach(column => {
      if (selectedCurves.includes(column)) {
        curves[state].curves[column] = {};
        curves[state].curves[column]["actuals"] = [];
        curves[state].curves[column]["model"] = [];
        curves[state].curves[column][`actuals_yMax`] = 0;
        curves[state].curves[column][`model_yMax`] = 0;

        if (counterfactualSelected) {
          curves[state].curves["CF_" + column] = {};
          curves[state].curves["CF_" + column]["actuals"] = [];
          curves[state].curves["CF_" + column]["model"] = [];
          curves[state].curves["CF_" + column][`actuals_yMax`] = 0;
          curves[state].curves["CF_" + column][`model_yMax`] = 0;
        }
      }
    });

    // split data into curves and maxiumus
    // split out actuals and model run
    trimmedData.forEach((day, index) => {
      Object.entries(day).forEach(([column, value]) => {
        if (selectedCurves.includes(column)) {
          // splitting out sources to make plotting easier later
          const source = day.source === "actuals" ? "actuals" : "model";

          // Start the modeled R Effective one day sooner
          // so that the plot does not have a gap because
          // they are plotted as two curves with separate styles
          if (
            source === "model" &&
            column === "R effective" &&
            trimmedData[index - 1].source === "actuals"
          ) {
            // create a new date object
            const newDate = new Date(day.date.toISOString());
            newDate.setDate(newDate.getDate() - 1);

            // Add the value from the actuals as the
            // first datapoint of the modeled data
            curves[state].curves[column][source].push({
              x: newDate,
              y: trimmedData[index - 1]["R effective"],
            });

            // Calculate Percentage changed for the day
            // before the first modeled date
            if (column === "R effective") {
              curves[state].curves.pctChange[source].push({
                x: newDate,
                y: (trimmedData[index - 1]["R effective"] / initialR_0) * 100,
              });
            }
          }

          // Calculate Percentage changed
          if (column === "R effective") {
            curves[state].curves.pctChange[source].push({
              x: day.date,
              y: (day["R effective"] / initialR_0) * 100,
            });
          }

          // Add curves based on name (column) and source
          curves[state].curves[column][source].push({
            x: day.date,
            y: value,
          });
          counterfactualSelected &&
            counterfactualRun[index] &&
            curves[state].curves["CF_" + column]["model"].push({
              x: day.date,
              y: counterfactualRun[index][column],
            });

          // Add Counterfactual curves with CF prefix
          if (counterfactualSelected) {
            curves[state].curves["CF_" + column][
              `${source}_yMax`
            ] = counterfactualRun[index]
              ? counterfactualRun[index][column]
                ? counterfactualRun[index][column] >
                  curves[state].curves["CF_" + column][`${source}_yMax`]
                  ? counterfactualRun[index][column]
                  : curves[state].curves["CF_" + column][`${source}_yMax`]
                : 0
              : curves[state].curves["CF_" + column][`${source}_yMax`];
          }

          // doing[`${source}_yMax`] as we go because we're already looping anyway
          curves[state].curves[column][`${source}_yMax`] =
            curves[state].curves[column][`${source}_yMax`] > value
              ? curves[state].curves[column][`${source}_yMax`]
              : value;
        }
      });
    });

    // date range for the state
    const dates = modelRun.map(day => day.date);
    curves[state].dateRange.push(dates.slice(0, 1)[0]);
    curves[state].dateRange.push(dates.slice(-1)[0]);

    //[`${source}_yMax`] for the state
    const actualsPeaks = Object.entries(curves[state].curves).map(
      ([curve, points]) => points[`${"actuals"}_yMax`]
    );
    const modelPeaks = Object.entries(curves[state].curves).map(
      ([curve, points]) => points[`${"model"}_yMax`]
    );
    curves[state][`actuals_yMax`] = Math.max(...actualsPeaks);
    curves[state][`model_yMax`] = Math.max(...modelPeaks);
  });

  // console.log(curves);

  return curves;
}
