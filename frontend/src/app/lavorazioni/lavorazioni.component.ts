import { Component, OnInit } from '@angular/core';
import {AppaltoService} from '../appalto.service';
import {risGetLavoro} from '../classi/risGetLavoro';
@Component({
  selector: 'app-lavorazioni',
  templateUrl: './lavorazioni.component.html',
  styleUrls: ['./lavorazioni.component.css']
})
export class LavorazioniComponent implements OnInit {

  constructor(private AppaltoService:AppaltoService) { }
  lavori: risGetLavoro[];
  filtersLoaded: Promise<boolean>;
  somma:number=0;
  ngOnInit() {
    this.AppaltoService.getLavori().subscribe(Res => {
      this.lavori=Res;
      this.somma=0;
      this.filtersLoaded=Promise.resolve(true);
      this.lavori.forEach(element =>{
        this.somma= +this.somma + +element.costoLavoro;
      })

      }, error => {
        console.error(error);}
        );
  }

}
