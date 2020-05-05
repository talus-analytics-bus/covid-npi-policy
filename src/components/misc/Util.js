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

// const getApiUrl = () => {
//   if (process.env.NODE_ENV === "production") {
//     if (window.location.href.search("https") > -1)
//       return "https://gida-tracking-api.ghscosting.org/";
//     else return "http://gida-tracking-api-dev.us-west-1.elasticbeanstalk.com/";
//   } else return "http://localhost:5002";
// };
//
// export const API_URL = getApiUrl();
