import { getVisitorMetrics } from "../lib/ga4";

(async () => {
  const data = await getVisitorMetrics();
  console.log(data);
})();
