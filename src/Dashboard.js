
import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import * as XLSX from "xlsx";

const COLORS = ["#1f77b4", "#2ca02c", "#ff7f0e", "#d62728", "#9467bd"];

const initialData = [
  { type: "Individual", count: 14192, total: 3827393000 },
  { type: "Company", count: 952, total: 605185700 },
  { type: "Trust", count: 183, total: 123600700 },
  { type: "Partnership", count: 87, total: 33886300 },
  { type: "Super Fund", count: 7, total: 8255900 }
];

const Dashboard = () => {
  const [authorized, setAuthorized] = useState(false);  
  const [codeInput, setCodeInput] = useState("");       
  const INVITE_CODE = "1127";                           
  const [data, setData] = useState(initialData);
  const [viewType, setViewType] = useState("pie");
  
  if (!authorized) {
  return (
    <div style={{ padding: "100px", textAlign: "center" }}>
      <h2>🔐 Enter Invite Code to Access</h2>
      <input
        type="text"
        placeholder="Enter code"
        value={codeInput}
        onChange={(e) => setCodeInput(e.target.value)}
        style={{ padding: "10px", fontSize: "16px" }}
      />
      <br /><br />
      <button
        onClick={() => {
          if (codeInput === INVITE_CODE) setAuthorized(true);
          else alert("❌ Invalid code");
        }}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        Access
      </button>
    </div>
  );
}

  const pieData = (key) => {
    const total = data.reduce((sum, item) => sum + item[key], 0);
    return data.map((item) => ({
      name: item.type,
      value: item[key],
      percent: ((item[key] / total) * 100).toFixed(1),
      raw: item[key]
    }));
  };

  const labelAdjust = {
    "Super Fund": -60,
    "Partnership": -30,
    "Trust": 0,
    "Company": 20,
    "Individual": 40,
  };

  const renderLabel = (entry) => {
    const RADIAN = Math.PI / 180;
    const radius = 110;
    const cx = 200;
    const cy = 150;
    const angle = entry.midAngle;
    const offset = labelAdjust[entry.name] || 0;
    const x = cx + (radius + 15) * Math.cos(-angle * RADIAN);
    const y = cy + (radius + 15) * Math.sin(-angle * RADIAN) + offset;

    return (
      <text x={x} y={y} fill="#000" fontSize="12px" textAnchor="middle" dominantBaseline="central">
        {`${entry.name}: ${entry.percent}% ($${entry.raw.toLocaleString()})`}
      </text>
    );
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, "serr_export.xlsx");
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
    <div style={{ marginBottom: 50 }}>
      <h3 style={{ textAlign: "left", marginLeft: 10, marginBottom: 5, color: "#111" }}>{title}</h3>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ResponsiveContainer width={500} height={300}>
          {viewType === "pie" ? (
            <PieChart>
              <Pie
                data={pieData(key)}
                cx="50%"
                cy="50%"
                label={(entry) => renderLabel(entry)}
                outerRadius={100}
                dataKey="value"
              >
                {pieData(key).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : (
            <BarChart data={pieData(key)}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value">
                {pieData(key).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#f4faff", padding: "20px", fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center", color: "#0d47a1", marginBottom: 30 }}>
        Exploring SERR Data for Unlodged Activity Statement from 2023–2024
      </h1>
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <button onClick={() => setViewType(viewType === "pie" ? "bar" : "pie")}>
          Toggle Chart View
        </button>
        <label style={{ marginLeft: 10 }}>
          <span style={{ marginRight: 6 }}>Import Excel:</span>
          <input type="file" accept=".xlsx, .xls" onChange={handleImport} />
        </label>
        <button onClick={handleExport} style={{ marginLeft: 10 }}>Export Excel</button>
      </div>
      {chartBlock("1. Unlodged Client Count by Type", "count", 0)}
      {chartBlock("2. Total Unlodged SERR Income", "total", 1)}
      {chartBlock("3. Average Income per Client", "total", 2)}
      <footer style={{ textAlign: "center", color: "#1f77b4", marginTop: 60 }}>
        Created by Yifan Zhang, 2025
      </footer>
    </div>
  );
};

export default Dashboard;
