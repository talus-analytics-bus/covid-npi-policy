const addPolicyAtDate = ({ obj, type, policy, date }) => {
  const category = policy.primary_ph_measure;
  const id = policy.id;

  // if nothing exists for the date
  if (!obj[date]) obj[date] = { [type]: { [category]: new Set([id]) } };
  // if the date exists but not the type
  else if (!obj[date][type]) obj[date][type] = { [category]: new Set([id]) };
  // if the type exists but not the category
  else if (!obj[date][type][category])
    obj[date][type][category] = new Set([id]);
  // if the category exists
  else obj[date][type][category].add(id);
};

const msPerDay = 86400000;
const getTimestamp = datestring =>
  Math.floor(new Date(datestring).getTime() / msPerDay);

const arrayFillDates = ({
  obj,
  dateArray,
  arrayOffset,
  policy,
  type,
  start,
  stop,
}) => {
  for (const timestamp of dateArray.slice(
    start - arrayOffset,
    stop - arrayOffset
  ))
    addPolicyAtDate({
      obj,
      policy,
      type,
      date: timestamp,
    });
};

const buildSummaryObjectFaster = data => {
  console.time("buildSummaryObjectFaster");

  // start date of earliest policy
  const startDate = new Date(data[data.length - 1].date_start_effective);
  const endDate = new Date();

  // pre-compute all the dates we will need so that we have
  // a unique integer for every date that we can use to find
  // where in the object each policy belongs instead of
  // comparing dates (slow)
  const dateArray = [];
  for (let day = startDate; day <= endDate; day.setDate(day.getDate() + 1))
    dateArray.push(Math.floor(day.getTime() / msPerDay));

  // this arrayOffset is the timestamp corresponding to the
  // 0th element in the array; any date has an index of
  // arrayOffset - timestamp, meaning that we don't have to
  // do any comparisons to put things at the right date.
  const arrayOffset = dateArray[0];

  const timestampToday = Math.floor(new Date().getTime() / msPerDay);

  const obj = {};
  for (const policy of data) {
    // enacted
    addPolicyAtDate({
      obj,
      policy,
      type: "enacted",
      date: getTimestamp(policy.date_start_effective),
    });

    // active
    arrayFillDates({
      obj,
      dateArray,
      arrayOffset,
      policy,
      type: "active",
      start: getTimestamp(policy.date_start_effective),
      stop: policy.date_end_actual
        ? new Date(policy.date_end_actual) <= new Date()
          ? getTimestamp(policy.date_end_actual)
          : timestampToday
        : timestampToday,
    });

    // expired
    if (policy.date_end_actual)
      arrayFillDates({
        obj,
        dateArray,
        arrayOffset,
        policy,
        type: "expired",
        start: getTimestamp(policy.date_end_actual),
        stop: timestampToday,
      });
  }

  console.timeEnd("buildSummaryObjectFaster");
  return obj;
};

export default buildSummaryObjectFaster;
