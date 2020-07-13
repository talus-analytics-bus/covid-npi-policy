// Take an array of models, one per state, and
// split them into curves for each column and source

// Structure:

// {
//   'state': {
//     dateRange: {min: min, max: max},
//     yMax: 1235,
//     curves: {
//       'curve name': {
//         yMax: 12345,
//         actuals: [{x: x, y: y}],
//         model: [{x: x, y: y}],
//       },
//     },
//   },
// }

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
    // console.log(model)

    // create state object
    curves[state] = {
      dateRange: [],
      yMax: 0,
      curves: {},
      interventions: model.interventions.filter(
        inter => inter.name !== "do_nothing"
      ),
      deaths: model.deaths,
      cases: model.cases,
      date: model.date,
      counterfactual_cases: model.counterfactual_cases,
      counterfactual_deaths: model.counterfactual_deaths,
    };

    const modelRun = parseModelString(
      model.results.filter(run => Object.keys(run)[0] !== run).slice(-1)[0].run
    );

    const counterfactualRun = parseModelString(
      model.results
        .filter(run => Object.keys(run)[0] !== run)
        .find(inter => inter.name.includes("do_nothing")).run
    );

    const trimmedData = modelRun;
    // console.log(trimmedData)

    // initial r_0 for the percentage change calc
    const initialR_0 = trimmedData[0]["R effective"];
    console.log(initialR_0);

    // create basic structure
    curves[state].curves["pctChange"] = {};
    curves[state].curves.pctChange["actuals"] = [];
    curves[state].curves.pctChange["model"] = [];
    Object.keys(trimmedData[0]).forEach(column => {
      if (selectedCurves.includes(column)) {
        curves[state].curves[column] = {};
        curves[state].curves[column]["actuals"] = [];
        curves[state].curves[column]["model"] = [];
        curves[state].curves[column]["yMax"] = 0;

        if (counterfactualSelected) {
          curves[state].curves["CF_" + column] = {};
          curves[state].curves["CF_" + column]["actuals"] = [];
          curves[state].curves["CF_" + column]["model"] = [];
          curves[state].curves["CF_" + column]["yMax"] = 0;
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
            (column === "R effective") &
              (trimmedData[index - 1].source === "actuals")
          ) {
            curves[state].curves[column][source].push({
              x: day.date.setDate(day.date.getDate() - 1),
              y: value,
            });
            counterfactualSelected &&
              counterfactualRun[index] &&
              curves[state].curves["CF_" + column]["model"].push({
                x: day.date.setDate(day.date.getDate() - 1),
                y: counterfactualRun[index][column],
              });
          }

          // Calculate Percentage changed
          if (column === "R effective") {
            curves[state].curves.pctChange[source].push({
              x: day.date,
              y: day["R effective"] / initialR_0,
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
            curves[state].curves["CF_" + column].yMax =
              curves[state].curves["CF_" + column].yMax >
              counterfactualRun[index][column]
                ? curves[state].curves["CF_" + column].yMax
                : counterfactualRun[index][column];
          }

          // doing yMax as we go because we're already looping anyway
          curves[state].curves[column].yMax =
            curves[state].curves[column].yMax > value
              ? curves[state].curves[column].yMax
              : value;
        }
      });
    });

    // date range for the state
    const dates = model.results.run.map(day => day.date);
    curves[state].dateRange.push(dates.slice(0, 1)[0]);
    curves[state].dateRange.push(dates.slice(-1)[0]);

    // console.log(Object.entries(curves[state].curves))

    // yMax for the state
    const peaks = Object.entries(curves[state].curves).map(
      ([curve, points]) =>
        // selectedCurves.includes(curve) ? points.yMax : 0
        points.yMax
    );
    curves[state].yMax = Math.max(...peaks);
  });

  return curves;
}
