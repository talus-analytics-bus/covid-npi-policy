import * as d3 from "d3/dist/d3.min";

/**
 * Returns true if the object has no keys, false otherwise.
 * @method isEmpty
 * @param  {[type]}  d [description]
 * @return {Boolean}   [description]
 */
export const isEmpty = d => {
  if (Object.keys(d).length === 0) return true;
  else return false;
};

// convert number to comma-ized number string
export const comma = v => d3.format(",.0f")(v);
