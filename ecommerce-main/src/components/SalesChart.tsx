"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface DailyData {
  date: string;
  revenue: number;
  orderCount: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  orderCount: number;
}

interface Props {
  dailyRevenue: DailyData[];
  monthlyRevenue: MonthlyData[];
}

export default function SalesChart({ dailyRevenue, monthlyRevenue }: Props) {
  const [view, setView] = useState<"daily" | "monthly">("daily");

  const hasData = view === "daily" ? dailyRevenue.length > 0 : monthlyRevenue.length > 0;

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <p>No sales data available yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView("daily")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            view === "daily"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setView("monthly")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            view === "monthly"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Monthly
        </button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {view === "daily" ? (
          <BarChart data={dailyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(val: string) => val.slice(5)}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`৳${Number(value).toLocaleString()}`, "Revenue"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`৳${Number(value).toLocaleString()}`, "Revenue"]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
