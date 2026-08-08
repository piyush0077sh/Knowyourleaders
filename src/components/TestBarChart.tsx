"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Register Chart.js modules required for Bar charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TestBarChart() {
  const data: ChartData<"bar"> = {
    labels: ["Governance", "Healthcare", "Infrastructure", "Education", "Economy", "Environment"],
    datasets: [
      {
        label: "Projects Completed 2025-2026",
        data: [42, 35, 58, 29, 45, 31],
        backgroundColor: "rgba(53, 81, 219, 0.85)",
        borderColor: "#3551db",
        borderWidth: 1.5,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(53, 81, 219, 1)",
      },
      {
        label: "Projects In Progress",
        data: [18, 22, 30, 15, 20, 14],
        backgroundColor: "rgba(194, 133, 10, 0.85)",
        borderColor: "#c2850a",
        borderWidth: 1.5,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(194, 133, 10, 1)",
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "Inter, sans-serif",
            size: 12,
            weight: 500,
          },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 16,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0c1222",
        titleFont: { family: "Inter, sans-serif", size: 13, weight: "bold" },
        bodyFont: { family: "Inter, sans-serif", size: 12 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "Inter, sans-serif",
            size: 12,
          },
          color: "#6b7394",
        },
      },
      y: {
        grid: {
          color: "#dfe2ec",
        },
        ticks: {
          font: {
            family: "Inter, sans-serif",
            size: 12,
          },
          color: "#6b7394",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <Card className="w-full border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              Constituency Development Overview
            </CardTitle>
            <CardDescription>
              Responsive Chart.js bar chart verification
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
            Chart.js + react-chartjs-2
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[350px] relative">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
