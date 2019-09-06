import {Component, OnInit} from '@angular/core';
import {SalService} from '../sal.service';

@Component({
  selector: 'app-avanzamento',
  templateUrl: './avanzamento.component.html',
  styleUrls: ['./avanzamento.component.css']
})
export class AvanzamentoComponent implements OnInit {

  constructor(private salService: SalService) {
  }

  public tableElements = [];

  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    layout: {
      padding: {
        left: 50,
        right: 0,
        top: 0,
        bottom: 0
      }
    },
    scales: {
      xAxes: [{
        type: 'time',
        scaleLabel: {
          display: true,
          labelString: 'Tempo'
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Valore monetario'
        }
      }]
    },
    onClick: (event, activeElements) => {
      const y = event.layerY;
      let winner;
      let minDiff = 5000;

      activeElements.forEach((value) => {
        if (Math.abs(value._model.y - y) < minDiff) {
          winner = value;
          minDiff = Math.abs(value._model.y - y);
        }
      });

      if (winner !== undefined) {
        console.log(winner);
        console.log(event);
        const datasetId = winner._datasetIndex;
        const id = winner._index;
        const elem = {
          dataset: winner._chart.data.datasets[datasetId].data[id].x,
          num: winner._chart.data.datasets[datasetId].data[id].SAL, value: winner._chart.data.datasets[datasetId].data[id].y
        };
        let cont = false;
        this.tableElements.forEach((element) => {
          if (element.dataset === elem.dataset && element.value === elem.value && element.num === elem.num) {
            cont = true;
          }
        });
        if (!cont) {
          this.tableElements.push(elem);
        }
      }
    }
  };

  public barChartType = 'line';
  public barChartLegend = false;
  public barChartData = [{fill: false, data: [], label: 'Avanzamento'}];

  ngOnInit() {
    this.salService.getGrafico().subscribe(res => {
        this.barChartData = [{fill: false, data: [], label: 'Avanzamento'}];

        res.forEach((elem) => {
          let chartElem = {x: null, y: null, SAL: null};
          chartElem.y = elem.val_monetario;
          chartElem.x = new Date(elem.timestamp);
          chartElem.SAL = elem.numeri_sal;

          this.barChartData[0].data.push(chartElem);
        });
      }
    );
  }
}
