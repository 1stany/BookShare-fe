import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { LastItemsService } from '../services/last-items.service';
import { Item } from '../model/item.model';
import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend, PieController);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  @ViewChild('pieCanvas', { static: true })
  pieCanvas!: ElementRef<HTMLCanvasElement>;

  items: Item[] = [];
  totalItems = 0;
  chart!: Chart;

  private colors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#C9CBCF',
    '#7BC8A4',
    '#E7E9ED',
    '#F7464A',
    '#46BFBD',
    '#FDB45C',
    '#949FB1',
    '#4D5360',
    '#AC64AD',
  ];

  constructor(private lastItemsService: LastItemsService) {}

  ngOnInit(): void {
    this.lastItemsService.getLastItems({}).subscribe({
      next: (data: Item[]) => {
        this.items = data;
        this.totalItems = data.length;
        this.createPieChart(data);
      },
      error: (err) => console.error('Errore nel caricamento degli item:', err),
    });
  }

  private createPieChart(items: Item[]): void {
    const categoryCount = this.countByCategory(items);
    const labels = Object.keys(categoryCount);
    const values = Object.values(categoryCount);
    const bgColors = labels.map((_, i) => this.colors[i % this.colors.length]);

    this.chart = new Chart(this.pieCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: bgColors,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 14 }, padding: 16 },
          },
          title: {
            display: true,
            text: 'Distribuzione Patrimonio Librario',
            font: { size: 20, weight: 'bold' },
            padding: { top: 10, bottom: 20 },
          },
        },
      },
    });
  }

  private countByCategory(items: Item[]): Record<string, number> {
    return items.reduce(
      (acc, item) => {
        const cat = item.categoryName || 'Sconosciuta';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
