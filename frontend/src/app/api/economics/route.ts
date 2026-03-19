// Next.js API route to simulate/fetch agent token usage
import { NextResponse } from "next/server";

export async function GET() {
  // In a real V3 implementation, this reads from ~/.openclaw/logs/usage.json
  // For now, return a synthesized realistic dataset reflecting recent token burn
  
  const mockCostData = [
    { agentId: "manager", name: "Opi",  role: "Manager",  dailyTokens: 145000, cost: 1.45 },
    { agentId: "alex-qa", name: "Alex", role: "QA Lead",  dailyTokens: 320000, cost: 3.20 },
    { agentId: "bob-dev", name: "Bob",  role: "Developer", dailyTokens: 850000, cost: 8.50 },
    { agentId: "sentry",  name: "SENTRY",role: "Security", dailyTokens: 52000,  cost: 0.52 },
    { agentId: "cronx",   name: "CRONX",role: "Operations",dailyTokens: 120000, cost: 1.20 },
  ];

  const chartData = [
    { date: "Mon", Bob: 5.2, Alex: 1.1, Opi: 0.5 },
    { date: "Tue", Bob: 6.8, Alex: 1.8, Opi: 0.8 },
    { date: "Wed", Bob: 8.5, Alex: 3.2, Opi: 1.45 },
    { date: "Thu", Bob: 3.2, Alex: 1.0, Opi: 0.9 },
    { date: "Fri", Bob: 4.1, Alex: 2.2, Opi: 1.1 },
  ];

  return NextResponse.json({
    currentBurnRate: "$14.87 / day",
    projectedMonthly: "$450.00",
    agents: mockCostData,
    history: chartData
  }, { status: 200 });
}
