import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Chart as ChartJS, CategoryScale, LinearScale, BarController, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { DashboardFacade } from './facade/dashboard.facade';
import { FormatEnumPipe } from '../../shared/pipes/format-enum.pipe';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarController, BarElement, Title, Tooltip, Legend);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {
  private readonly dashboardFacade = inject(DashboardFacade);
  private changeDetection = inject(ChangeDetectorRef);
  statusCount = this.dashboardFacade.statusSignal;
  priorityCount = this.dashboardFacade.prioritySignal;
  statusChartData!: ChartConfiguration['data'];
  statusChartOptions!: ChartConfiguration['options'];
  priorityChartData!: ChartConfiguration['data'];
  priorityChartOptions!: ChartConfiguration['options'];
  chartType: 'bar' = 'bar';

  constructor() {
    effect(() => {
      const status = this.statusCount();
      const priority = this.priorityCount();
      if (Object.values(status).some(v => v > 0) || Object.values(priority).some(v => v > 0)) {
        this.initializeChartsData();
        this.changeDetection.markForCheck();
      }
    });
  }

  mapStatusToChartData(): ChartConfiguration['data'] {
    return {
      labels: Object.keys(this.statusCount()).map(status => FormatEnumPipe.prototype.transform(status)),
      datasets: [
        {
          label: 'Tasks by Status',
          data: Object.values(this.statusCount()),
          backgroundColor: ['#6c757d', '#ffc107', '#198754'],
          borderColor: ['#5a6268', '#e0a800', '#146c43'],
          borderWidth: 1
        }
      ]
    };
  }

  mapPriorityToChartData(): ChartConfiguration['data'] {
    return {
      labels: Object.keys(this.priorityCount()).map(priority => FormatEnumPipe.prototype.transform(priority)),
      datasets: [
        {
          label: 'Tasks by Priority',
          data: Object.values(this.priorityCount()),
          backgroundColor: ['#0dcaf0', '#ffc107', '#dc3545'],
          borderColor: ['#0aa2c0', '#e0a800', '#bb2d3b'],
          borderWidth: 1
        }
      ]
    };
  }

  initializeChartsData() {
      // Tasks by Status Chart
  this.statusChartData = this.mapStatusToChartData();

  this.statusChartOptions = {
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
        max: 20
      }
    }
  };

  // Tasks by Priority Chart
  this.priorityChartData = this.mapPriorityToChartData();

  this.priorityChartOptions = {
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
        max: 20
      }
    }
  };
  }
}
