import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const rawCounts = [
  { type: "Individual", count: 14192 },
  { type: "Company", count: 952 },
  { type: "Trust", count: 183 },
  { type: "Partnership", count: 87 },
  { type: "Super Fund", count: 7 }
];

const rawTotals = [
  { type: "Individual", income: 3827393000 },
  { type: "Company", income: 605185700 },
  { type: "Trust", income: 123600700 },
  { type: "Partnership", income: 29481070 },
  { type: "Super Fund", income: 577913.6 }
];

const rawAverages = [
  { type: "Trust", average: 675413.62 },
  { type: "Company", average: 635699.30 },
  { type: "Partnership", average: 338862.88 },
  { type: "Individual", average: 269686.63 },
  { type: "Super Fund", average: 82559.09 }
];

export default function Dashboard() {
  const [filter, setFilter] = useState("All");

  const filteredCounts = filter === "All" ? rawCounts : rawCounts.filter(d => d.type === filter);
  const filteredTotals = filter === "All" ? rawTotals : rawTotals.filter(d => d.type === filter);
  const filteredAverages = filter === "All" ? rawAverages : rawAverages.filter(d => d.type === filter);

  const handleExport = () => {
    const csv = ["Type,Count,Income,Average"];
    rawCounts.forEach((c, i) => {
      const t = rawTotals[i]?.income || 0;
      const a = rawAverages[i]?.average || 0;
      csv.push(`${c.type},${c.count},${t},${a}`);
    });
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "serr-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-3xl font-bold text-blue-800">SERR Lodgement Dashboard (2024 FY)</h1>

      <p className="text-gray-600 text-base">This dashboard shows clients with unlodged SERR income for the 2024 financial year. Data is grouped by client type and summarised by count, total income, and average income per client.</p>

      <div className="flex items-center gap-4 mt-4">
        <label className="text-sm">Filter by Client Type:</label>
        <select
          className="border p-1 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          {rawCounts.map(d => (
            <option key={d.type} value={d.type}>{d.type}</option>
          ))}
        </select>

        <button
          onClick={handleExport}
          className="ml-auto bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-2">1. Unlodged Client Count by Type</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredCounts}>
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-2">2. Total Unlodged SERR Income</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredTotals}>
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Bar dataKey="income" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-2">3. Average SERR Income per Client</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredAverages}>
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
            <Bar dataKey="average" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <footer className="text-center text-sm text-gray-500 pt-10">
        Created by Yifan Zhang, 2025
      </footer>
    </div>
  );
}
