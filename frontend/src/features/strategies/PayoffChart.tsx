import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PayoffChartProps {
  data: { underlying: number; pnl: number }[];
  currentPrice: number;
}

export const PayoffChart: React.FC<PayoffChartProps> = ({ data, currentPrice }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No payoff data available</div>;
  }

  const labels = data.map(d => d.underlying);
  const pnlValues = data.map(d => d.pnl);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Profit/Loss (₹)',
        data: pnlValues,
        borderColor: (context: any) => {
          const val = context.raw;
          return val >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'; // green/red line
        },
        backgroundColor: (context: any) => {
          const val = context.raw;
          return val >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
        },
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        segment: {
          borderColor: (ctx: any) => ctx.p1.parsed.y >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
        }
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
      annotation: {
         // Could add a vertical line for current price here if we add chartjs-plugin-annotation
      }
    },
    scales: {
      x: {
        grid: { display: false, color: '#333' },
        ticks: { color: '#888' },
        title: { display: true, text: 'Underlying Price at Expiry', color: '#aaa' }
      },
      y: {
        grid: { color: '#333' },
        ticks: { color: '#888' },
        title: { display: true, text: 'Net Payoff (₹)', color: '#aaa' }
      }
    }
  };

  return (
    <div className="w-full h-[400px]">
      <Line options={options} data={chartData} />
    </div>
  );
};
