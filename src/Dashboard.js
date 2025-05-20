
import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import * as XLSX from "xlsx";

const COLORS = ["#1f77b4", "#2ca02c", "#ff7f0e", "#d62728", "#9467bd"];
const TYPES = ["Individual", "Company", "Trust", "Partnership", "Super Fund"];

const initialData = [
  { type: "Individual", count: 14192, total: 3827393000 },
  { type: "Company", count: 952, total: 605185700 },
  { type: "Trust", count: 183, total: 123600700 },
  { type: "Partnership", count: 87, total: 33886300 },
  { type: "Super Fund", count: 7, total: 8255900 }
];

const Dashboard = () => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState("pie");

  useEffect(() => {
    setTimeout(() => setLoading(false), 800); // Loading 动效
  }, []);

  const pieData = (key) => {
    const total = data.reduce((sum, item) => sum + item[key], 0);
    return data.map((item) => ({
      name: item.type,
      value: item[key],
      percent: ((item[key] / total) * 100).toFixed(1),
      raw: item[key]
    }));
  };

  const renderLabel = (entry) =>
    `${entry.name}: ${entry.percent}% ($${entry.raw.toLocaleString()})`;

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, "serr8_export.xlsx");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(ws);
      setData(parsed);
    };
    reader.readAsBinaryString(file);
  };

  const chartBlock = (title, key, chartIndex) => (
    <div style={{ textAlign: "center", margin: "20px" }}>
      <h3 style={{ textAlign: "left", marginLeft: 20 }}>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {viewType === "pie" ? (
          <PieChart>
            <Pie
              data={pieData(key)}
              cx="50%"
              cy="50%"
              label={renderLabel}
              outerRadius={100}
              dataKey="value"
            >
              {pieData(key).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        ) : (
          <BarChart data={pieData(key)}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#1f77b4" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );

  if (loading) return <div style={{ textAlign: "center", padding: 40 }}>Loading...</div>;

  return (
    <div style={{ backgroundColor: "#f2f8fc", padding: "20px", fontFamily: "Arial" }}>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setViewType(viewType === "pie" ? "bar" : "pie")}>
          Toggle Chart View
        </button>
        <input type="file" accept=".xlsx, .xls" onChange={handleImport} style={{ marginLeft: 10 }} />
        <button onClick={handleExport} style={{ marginLeft: 10 }}>Export Excel</button>
      </div>
      {chartBlock("1. Unlodged Client Count by Type", "count", 1)}
      {chartBlock("2. Total Unlodged SERR Income", "total", 2)}
      {chartBlock("3. Average Income per Client", "average", 3)}
    </div>
  );
};

export default Dashboard;
