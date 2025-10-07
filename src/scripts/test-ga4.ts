import { getPageViews } from "../lib/ga4";

(async () => {
  const data = await getPageViews();
  console.log(data);
})();
