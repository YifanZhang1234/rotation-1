
import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer
} from "recharts";

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

const COLORS = ["#1f77b4", "#2ca02c", "#ff7f0e", "#d62728", "#9467bd"];

export default function Dashboard() {
  const [filter, setFilter] = useState("All");
  const [chartType, setChartType] = useState("bar");
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState(rawCounts);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const filteredCounts = filter === "All" ? counts : counts.filter(d => d.type === filter);
  const filteredTotals = filter === "All" ? rawTotals : rawTotals.filter(d => d.type === filter);
  const filteredAverages = filter === "All" ? rawAverages : rawAverages.filter(d => d.type === filter);

  const offsetMap = {
    "Super Fund": chartIndex => chartIndex === 2 ? -60 : -15,
    "Partnership": chartIndex => chartIndex === 2 ? -30 : -15,
    "Trust": chartIndex => chartIndex === 2 ? -10 : 0,
    "Company": () => 0,
    "Individual": () => 0
  };

  const renderLabel = (entry, index, chartIndex, key) => {
    const RADIAN = Math.PI / 180;
    const radius = 110;
    const cx = 200;
    const cy = 150;
    const angle = entry.midAngle;
    const offset = offsetMap[entry.name]?.(chartIndex) || 0;
    const x = cx + (radius + 30) * Math.cos(-angle * RADIAN);
    const y = cy + (radius + 30) * Math.sin(-angle * RADIAN) + offset;
    const value = key === "count" ? entry.count :
                  key === "income" ? `$${entry.income.toLocaleString()}` :
                  `$${entry.average.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    const percent = `${(entry.percent * 100).toFixed(1)}%`;

    return (
      <text x={x} y={y} fill="#000" fontSize="12px" textAnchor="middle" dominantBaseline="central">
        {`${entry.name}: ${percent} (${value})`}
      </text>
    );
  };

  const renderChart = (data, key, chartIndex) => chartType === "bar" ? (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="type" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={key} fill={COLORS[chartIndex % COLORS.length]} />
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          dataKey={key}
          nameKey="type"
          cx={200}
          cy={150}
          outerRadius={100}
          label={(entry, index) => renderLabel(entry, index, chartIndex, key)}
        >
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const handleUpload = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const lines = reader.result.split("\n").slice(1);
      const parsed = lines.map(line => {
        const [type, count] = line.split(",");
        return { type, count: parseInt(count) };
      }).filter(d => d.type);
      setCounts(parsed);
    };
    if (file) reader.readAsText(file);
  };

  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center", backgroundColor: "#f4faff", minHeight: "100vh", padding: "2rem" }}>
      {loading ? <h2 style={{ color: "#1f77b4" }}>Loading...</h2> : <>
        <h1 style={{ color: "#1f77b4" }}>SERR Dashboard</h1>
        <div style={{ marginBottom: "1rem" }}>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ marginRight: "1rem" }}>
            <option value="All">All</option>
            {counts.map(d => <option key={d.type}>{d.type}</option>)}
          </select>
          <button onClick={() => setChartType(chartType === "bar" ? "pie" : "bar")} style={{ marginRight: "1rem" }}>
            Switch to {chartType === "bar" ? "Pie" : "Bar"} Chart
          </button>
          <input type="file" accept=".csv" onChange={handleUpload} />
        </div>
        <h2>1. Unlodged Count</h2>
        {renderChart(filteredCounts, "count", 0)}
        <h2>2. Total SERR Income</h2>
        {renderChart(filteredTotals, "income", 1)}
        <h2>3. Average Income per Client</h2>
        {renderChart(filteredAverages, "average", 2)}
        <footer style={{ marginTop: "3rem", color: "#1f77b4" }}>Created by Yifan Zhang, 2025</footer>
      </>}
    </div>
  );
}
