import { Component, OnInit } from '@angular/core';
import {GiornaleService } from '../giornale.service';
import {rigoGiornale} from '../classi/rigoGiornale';
import {Router} from '@angular/router';
import { DatepickerDateCustomClasses } from 'ngx-bootstrap/datepicker';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-giornale',
  templateUrl: './giornale.component.html',
  styleUrls: ['./giornale.component.css']
})
export class GiornaleComponent implements OnInit {

   constructor( private GiornaleService:GiornaleService, private router:Router, private cookieService:CookieService) { }


   filtersLoaded: Promise<boolean>; 

   ris: string;
    

   data: Date;

   giornale:{ //questo è per il singolo giornale odierno
     timestamp: number,
     num_giorn:number,
     righi:rigoGiornale[]
   } [];

  dateCustomClasses: DatepickerDateCustomClasses[];

  finishGiornale(){
    this.GiornaleService.finishGiornale().subscribe(Result =>{
      alert("Giornale terminato");
      this.GiornaleService.getGiornale().subscribe(res=>{
        this.giornale=res;
        this.filtersLoaded=Promise.resolve(true);
      })
      },
      error => {
         console.error(error);
         alert("giornale non terminato");}
         );
  }

  onValueChange(event) {

    this.data = event;

    this.GiornaleService.getGiornaliMese(event.getMonth()).subscribe(res => {
      this.dateCustomClasses = [];
      res.forEach((value) => {
        let date = new Date(event);
        date.setDate(value);
          this.dateCustomClasses.push({date: date, classes: ['has_register']});
      });
    })
  }
 
  
   ngOnInit() {
      this.GiornaleService.getGiornaliMese(new Date().getMonth()).subscribe(res => {
        this.dateCustomClasses = [];
        res.forEach((value) => {
          let date = new Date();
          date.setDate(value);
            this.dateCustomClasses.push({date: date, classes: ['has_register']});
        });
      })

      this.GiornaleService.getGiornale().subscribe(res =>{
         this.giornale=res;
         this.filtersLoaded=Promise.resolve(true);},
         error => {
            console.error(error);
            this.filtersLoaded=Promise.reject();}
            );
    }

}
