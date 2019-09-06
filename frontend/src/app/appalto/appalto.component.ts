import { Component, OnInit } from '@angular/core';
import {AppaltoService} from '../appalto.service'
import { Router } from '@angular/router';
import {risGetLavoro} from '../classi/risGetLavoro';
import { NgxSmartModalService } from 'ngx-smart-modal';
@Component({
  selector: 'app-appalto',
  templateUrl: './appalto.component.html',
  styleUrls: ['./appalto.component.css']
})
export class AppaltoComponent implements OnInit {

  constructor(private AppaltoService:AppaltoService, private router:Router, private ngxSmartModalService:NgxSmartModalService ) { }

  nomi:string[]=[]; //servono per mappare con gli ngModel del form di modifica
  costi:number[]=[];

  filtersLoaded: Promise<boolean>;
  sommaLoaded: Promise<boolean>;


  result: risGetLavoro[];
  codLavoro: string;
  nomeLavoro: string;
  costoLavoro: number;
  somma:number;

  lavori:{codLavoro:string,
     nomeLavoro:string,
    costoLavoro:number}[];

  trackElement(index: number, element: any) {
      return element ? element.guid : null
    }


  aggiungiLavoro(form){
      this.AppaltoService.addLavoro({codLavoro:form.value.codLavoro,nomeLavoro:form.value.nomeLavoro,costoLavoro:form.value.costoLavoro}).subscribe(Result =>{ 
        
        alert("Lavoro aggiunto correttamente");
        this.aggiorna();
      }, 
        error => {
          console.error(error);
          alert("lavoro non aggiunto");}
      
      );
    }

  aggiorna(){
      this.AppaltoService.getLavori().subscribe(Res => {
        this.result=Res;
        this.somma=0;
        this.result.forEach(element =>{
          this.somma= +this.somma + +element.costoLavoro;

        });
        this.sommaLoaded=Promise.resolve(true);
      this.router.navigate([this.router.url]);
      });
    }
  

  updateLavoro(codLavoro:string,form){
      console.log(codLavoro);
      console.log(form.value);
      let send={
        codLavoro:codLavoro,
        nomeLavoro:form.value.newNomeLavoro,
        costoLavoro:form.value.newCostoLavoro
      }
  
      this.AppaltoService.updateLavoro(send).subscribe(Ris=>{
       
        alert("lavoro modificato");
        this.aggiorna();
      }, 
      error => {
        console.error(error);
        alert("lavoro non modificato");}
        );
    }


    updateSoglia(form){
      console.log(form.value);
      this.AppaltoService.updateSoglia(form.value).subscribe(Result => {
        this.AppaltoService.finishSoglia().subscribe(Ris=>{
          alert('contratto terminato');
          this.router.navigate(['/avanzamento']);
        })

      },
      error => {
        console.error(error);
        alert("contratto non terminato");}
        );
    }

    termina(){
      this.AppaltoService.finishSoglia().subscribe(Ris=>{
  
          alert("inserimento soglia terminato");
          this.router.navigate(['/giornale']);
  
      },error => {
        console.error(error);
        alert("inserimento soglia non terminato");}
        );
      
  
    }


  ngOnInit() {
    this.aggiorna();
  }

}
