export function calculateChange(
  current: number,
  previous: number
): { change: string; changeType: "up" | "down" } {
  if (previous === 0) {
    return { change: "N/A", changeType: "up" };
  }

  const diff = current - previous;
  const percentage = (diff / previous) * 100;

  return {
    change: `${Math.abs(Number(percentage.toFixed(1)))}% from last month`,
    changeType: diff >= 0 ? "up" : "down",
  };
}
