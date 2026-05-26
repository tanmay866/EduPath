import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const ChartCard = ({ title, subtitle, data, type = 'bar' }) => {
  const fallbackData = [
    { name: 'DSA', value: 25 },
    { name: 'MERN', value: 40 },
    { name: 'Java', value: 30 },
  ];

  const chartData = !data || data.length === 0 ? fallbackData : data;

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.5rem',
                  color: '#e5e7eb',
                }}
                labelStyle={{ color: '#e5e7eb', fontWeight: 600 }}
                itemStyle={{ color: '#a5b4fc' }}
              />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.5rem',
                  color: '#e5e7eb',
                }}
                labelStyle={{ color: '#e5e7eb', fontWeight: 600 }}
                itemStyle={{ color: '#a5b4fc' }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.5rem',
                  color: '#e5e7eb',
                }}
                labelStyle={{ color: '#e5e7eb', fontWeight: 600 }}
                itemStyle={{ color: '#a5b4fc' }}
              />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl shadow-lg p-6 text-gray-200 hover:border-white/20 transition">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className="h-72">{renderChart()}</div>
    </div>
  );
};

export default ChartCard;
