
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import * as XLSX from "xlsx";

const COLORS = ["#1f77b4", "#2ca02c", "#ff7f0e", "#d62728", "#9467bd"];
const TYPES = ["Individual", "Company", "Trust", "Partnership", "Super Fund"];

const initialData = [
  {
    title: "1. Unlodged Client Count by Type",
    data: [
      { name: "Individual", value: 14192 },
      { name: "Company", value: 952 },
      { name: "Trust", value: 183 },
      { name: "Partnership", value: 87 },
      { name: "Super Fund", value: 7 }
    ]
  },
  {
    title: "2. Total Unlodged SERR Income",
    data: [
      { name: "Individual", value: 3827393000 },
      { name: "Company", value: 605185700 },
      { name: "Trust", value: 123600700 },
      { name: "Partnership", value: 29013800 },
      { name: "Super Fund", value: 5781800 }
    ]
  },
  {
    title: "3. Average Income per Client",
    data: [
      { name: "Trust", value: 675414 },
      { name: "Company", value: 635699 },
      { name: "Partnership", value: 338863 },
      { name: "Individual", value: 269687 },
      { name: "Super Fund", value: 82559 }
    ]
  }
];

const Dashboard = () => {
  const [charts, setCharts] = useState(initialData);
  const [chartType, setChartType] = useState("pie");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      const grouped = TYPES.map((type) => ({
        name: type,
        value: json.filter((row) => row.ClientType === type).reduce((acc, cur) => acc + (cur.Income || 0), 0)
      }));
      setCharts([
        charts[0],
        { title: "2. Total Unlodged SERR Income", data: grouped },
        charts[2]
      ]);
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    const rows = [];
    charts.forEach((chart) =>
      chart.data.forEach((d) =>
        rows.push({ Chart: chart.title, ClientType: d.name, Value: d.value })
      )
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dashboard");
    XLSX.writeFile(wb, "serr_dashboard_export.xlsx");
  };

  const labelOffset = (name, chartIndex) => {
    if (name === "Partnership") return chartIndex < 2 ? 15 : 25;
    if (name === "Super Fund" && chartIndex === 2) return -20;
    return 0;
  };

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ padding: 40, background: "#edf2f7", fontFamily: "Arial" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => setChartType(chartType === "pie" ? "bar" : "pie")}>
          Toggle Chart Type
        </button>
        <input
          type="file"
          accept=".csv, .xlsx"
          onChange={handleImport}
          title="Import Excel"
        />
        <button onClick={handleExport}>Export Excel</button>
      </div>
      {charts.map((chart, index) => (
        <div key={index} style={{ textAlign: "left", marginTop: 40 }}>
          <h2 style={{ marginBottom: 10 }}>{chart.title}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chart.data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent, value }) =>
                  `${name}: ${(percent * 100).toFixed(1)}% ($${value.toLocaleString()})`
                }
                labelLine={false}
              >
                {chart.data.map((entry, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={COLORS[i % COLORS.length]}
                    labelOffset={labelOffset(entry.name, index)}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
