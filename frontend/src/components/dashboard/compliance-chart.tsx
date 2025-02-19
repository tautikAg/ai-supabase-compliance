import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplianceReport } from '@/types';
import { APIService } from '@/lib/api';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ComplianceChartProps {
  className?: string;
}

export function ComplianceChart({ className }: ComplianceChartProps) {
  const [report, setReport] = useState<ComplianceReport | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await APIService.getComplianceReport();
        setReport(data);
      } catch (error) {
        console.error('Failed to fetch compliance report:', error);
      }
    };

    fetchReport();
  }, []);

  const data: ChartData<'pie'> = {
    labels: ['Compliant', 'Non-Compliant'],
    datasets: [
      {
        data: [
          [report?.mfa.status, report?.rls.status, report?.pitr.status].filter(
            (status) => status === 'pass'
          ).length || 0,
          [report?.mfa.status, report?.rls.status, report?.pitr.status].filter(
            (status) => status === 'fail'
          ).length || 0,
        ],
        backgroundColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
        borderColor: ['rgb(21, 128, 61)', 'rgb(185, 28, 28)'],
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => (a as number) + (b as number), 0);
            const percentage = ((value as number) / (total as number)) * 100;
            return `${label}: ${value} (${percentage.toFixed(1)}%)`;
          },
        },
      },
    },
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Compliance Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <Pie data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
} 