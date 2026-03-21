// Next.js API route to simulate/fetch agent token usage
import { NextResponse } from "next/server";

export async function GET() {
  const mockCostData = [
    { agentId: "main", name: "OPI", role: "CEO / Mission Control", dailyTokens: 140000, cost: 1.4 },
    { agentId: "bob", name: "BOB", role: "Builder / Developer", dailyTokens: 820000, cost: 8.2 },
  ];

  const chartData = [
    { date: "Mon", Bob: 5.1, Opi: 0.6 },
    { date: "Tue", Bob: 6.4, Opi: 0.9 },
    { date: "Wed", Bob: 8.2, Opi: 1.4 },
    { date: "Thu", Bob: 3.8, Opi: 0.8 },
    { date: "Fri", Bob: 4.6, Opi: 1.0 },
  ];

  const totalDaily = mockCostData.reduce((sum, item) => sum + item.cost, 0);
  const projectedMonthly = totalDaily * 30;

  return NextResponse.json({
    currentBurnRate: `$${totalDaily.toFixed(2)} / day`,
    projectedMonthly: `$${projectedMonthly.toFixed(2)}`,
    agents: mockCostData,
    history: chartData,
  }, { status: 200 });
}
