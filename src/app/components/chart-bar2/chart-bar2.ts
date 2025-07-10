import { Component, input, OnChanges, output, SimpleChanges, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MatButton, MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-chart-bar2',
  imports: [
    MatButtonModule,
    BaseChartDirective
  ],
  templateUrl: './chart-bar2.html',
  styleUrl: './chart-bar2.scss'
})
export class ChartBar2 implements OnChanges
{
  @ViewChild(BaseChartDirective) chart: BaseChartDirective<'bar'> | undefined;

  public barChartType = 'bar' as const;
  public labels : string[] = [];
  public newLabels = input<string[]>([]);
  public data: number[] = [];
  public newData = input<number[]>([]); 


 public barChartData: ChartData<'bar'> = {
    labels: this.labels,
    datasets: [
      { data: this.data, label: 'Turnos' },
    ],
  };

  ngOnChanges(changes: SimpleChanges): void
  {
    this.labels.length = 0;
    this.data.length = 0;
    this.labels.push(...this.newLabels());
    this.data.push(...this.newData());
    this.chart?.update();
  }

}
