import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Chart as ChartJS, CategoryScale, LinearScale, BarController, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarController, BarElement, Title, Tooltip, Legend);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  // Tasks by Status Chart
  statusChartData: ChartConfiguration['data'] = {
    labels: ['Todo', 'In Progress', 'Done'],
    datasets: [
      {
        label: 'Tasks by Status',
        data: [5, 3, 8],
        backgroundColor: ['#6c757d', '#ffc107', '#198754'],
        borderColor: ['#5a6268', '#e0a800', '#146c43'],
        borderWidth: 1
      }
    ]
  };

  statusChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Tasks by Status'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10
      }
    }
  };

  // Tasks by Priority Chart
  priorityChartData: ChartConfiguration['data'] = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        label: 'Tasks by Priority',
        data: [4, 6, 6],
        backgroundColor: ['#0dcaf0', '#ffc107', '#dc3545'],
        borderColor: ['#0aa2c0', '#e0a800', '#bb2d3b'],
        borderWidth: 1
      }
    ]
  };

  priorityChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Tasks by Priority'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10
      }
    }
  };

  chartType: 'bar' = 'bar';
}
