import React from "react";
import { StatisticsCard } from "./StatisticsCard";
import { ShoppingCart, Wallet, BookCheck, Globe } from "lucide-react";

const AnalyticCardSection = () => {
  return (
    <div className="flex md:flex-row flex-col justify-center gap-5 ">
      <StatisticsCard
        title="Total booking"
        value="76"
        change="Up 8.5% from last month"
        changeType="up"
        icon={ShoppingCart}
      />

      <StatisticsCard
        title="Total sales"
        value="฿58,829"
        change="Up 8.5% from last month"
        changeType="up"
        icon={Wallet}
      />

      <StatisticsCard
        title="Total booking users"
        value="66"
        change="Down 8.5% from last month"
        changeType="down"
        icon={BookCheck}
      />

      <StatisticsCard
        title="Total site visitors"
        value="459"
        change="Up 8.5% from last month"
        changeType="up"
        icon={Globe}
      />
    </div>
  );
};

export default AnalyticCardSection;
