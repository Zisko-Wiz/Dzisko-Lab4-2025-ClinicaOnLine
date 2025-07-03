import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ChartData, ChartOptions,ChartConfiguration, ChartEvent } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { SupaService } from '../../services/supa.service';


@Component({
  selector: 'app-chart-bar',
  imports: [BaseChartDirective],
  templateUrl: './chart-bar.html',
  styleUrl: './chart-bar.scss'
})
export class ChartBar implements OnInit, AfterViewInit
{
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  private supaService = inject(SupaService)
  private dataSource : { turnos: number; especialidad: string; }[] = [];
  public barChartType = 'bar' as const;

  barChartData: ChartData<'bar'> = {
    labels: this.dataSource.map(x => x.especialidad),
    datasets: [
      {
        label: 'Turnos',
        data: this.dataSource.map(x => x.turnos)
      }
    ],
  };

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Turnos por especialidad',
      },
    },
  };

  ngOnInit(): void
  {
    this.getTurnos()
    
  }

  ngAfterViewInit(): void
  {

    if (this.chart?.chart != undefined)
    {
      this.chart.chart!.config.data.labels = this.dataSource.map(x => x.especialidad);
      this.chart.chart!.config.data.datasets =
        [{
          label: 'Turnos',
          data: this.dataSource.map(x => x.turnos)
        }]

        this.chart.update();
    }
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

          this.dataSource.length = 0;
          this.dataSource.push(...data);

          this.barChartData.labels = this.dataSource.map(x => x.especialidad);

          this.barChartData.datasets =
          [
            {
              label: 'Turnos',
              data: this.dataSource.map(x => x.turnos)
            }
          ]
          
          
        }

      }
    )
  }

  test()
  {
    
    if (this.chart?.chart != undefined)
    {
      console.log(this.dataSource);
      
      this.chart.chart!.config.data.labels = [ "neurología", "cardiología", "oftalmología" ];
      this.chart.chart!.config.data.datasets =
        [{
          label: 'Turnos',
          data: [ 4, 1, 3 ]
        }]
    }
  }

}
