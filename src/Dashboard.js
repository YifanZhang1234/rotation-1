import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";

const COLORS = ["#1f77b4", "#2ca02c", "#ff7f0e", "#d62728", "#9467bd"];
const LABELS = ["Individual", "Company", "Trust", "Partnership", "Super Fund"];

const sampleData = [
  { type: "Individual", value: 92192, amount: 14192 },
  { type: "Company", value: 6200, amount: 952 },
  { type: "Trust", value: 1200, amount: 183 },
  { type: "Partnership", value: 600, amount: 87 },
  { type: "Super Fund", value: 7, amount: 7 },
];

export default function Dashboard() {
  const [data, setData] = useState(sampleData);

  const handleImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const imported = XLSX.utils.sheet_to_json(ws);
      setData(imported);
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SERR");
    XLSX.writeFile(wb, "serr_export.xlsx");
  };

  return (
    <div style={{ fontFamily: "Arial", textAlign: "center", backgroundColor: "#edf2f7", minHeight: "100vh", padding: "2rem" }}>
      <h1 style={{ color: "#1f77b4", fontSize: "28px", marginBottom: "2rem" }}>
        Exploring SERR Data for Unlodged Activity Statement from 2023–2024
      </h1>

      <div style={{ marginBottom: "1rem" }}>
        <input type="file" accept=".xlsx, .xls" onChange={handleImport} />
        <button onClick={handleExport} style={{ marginLeft: "1rem" }}>Export Excel</button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "2rem" }}>
        <ResponsiveContainer width="40%" height={300}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="type" cx="50%" cy="50%" outerRadius={80} label={({ name, percent, amount }) => `${name}: ${(percent * 100).toFixed(1)}% ($${amount})`}>
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="40%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value">
              {data.map((entry, index) => <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
