import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MatButton } from '@angular/material/button';
import { SupaService } from '../../services/supa.service';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './test.html',
  styleUrl: './test.scss',
  standalone: true,
  imports: [MatButton, BaseChartDirective],
})
export class BarChartComponent implements OnInit
{
  @ViewChild(BaseChartDirective) chart: BaseChartDirective<'bar'> | undefined;

  private supaService = inject(SupaService);
  protected dataSource: {especialidad: string, turnos: number}[] = [{especialidad: 'algo', turnos: 10}];

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      x: {},
      y: {
        min: 10,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },
  };
  public barChartType = 'bar' as const;

  public barChartData: ChartData<'bar'> = {
    labels: this.dataSource.map(x => x.especialidad),
    datasets: [
        { label: 'Turnos',
        data: this.dataSource.map(x => x.turnos)}
    ],
  };

  ngOnInit(): void
  {
    this.getTurnos()  
  }

    async getTurnos()
  {

    return this.supaService.supabase.from('turnos')
    .select(
      `
      turnos:count(),
      especialidad
      `
    )
    .then(
      ({data, error}) => {
        if (error)
        {
          console.log(error.message);          
        } else {
          this.dataSource = data;
          this.chart?.update();
        }

      }
    )
  }


  // events
  public chartClicked({
    event,
    active,
  }: {
    event?: ChartEvent;
    active?: object[];
  }): void {
    console.log(event, active);
  }

  public chartHovered({
    event,
    active,
  }: {
    event?: ChartEvent;
    active?: object[];
  }): void {
    console.log(event, active);
  }

  public randomize(): void {
    // Only Change 3 values
    // this.barChartData.datasets[0].data = [
    //   Math.round(Math.random() * 100),
    //   59,
    //   80,
    //   Math.round(Math.random() * 100),
    //   56,
    //   Math.round(Math.random() * 100),
    //   40,
    // ];

    this.chart?.ngOnChanges({});

    this.chart?.update();
  }
}