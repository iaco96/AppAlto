import { Component, OnInit } from '@angular/core';
import {Registro} from '../classi/Registro';
import {RegistroService} from '../registro.service';
import {AppaltoService} from '../appalto.service';
import { LoginService } from '../login.service';
import { CookieService } from 'ngx-cookie-service';
import { DatepickerDateCustomClasses } from 'ngx-bootstrap/datepicker';
@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {

  constructor(private cookieService:CookieService,private RegistroService:RegistroService, private AppaltoService:AppaltoService, private LoginService:LoginService) { }

  registro:Registro[];
  registri_da_compilare: {num_libretto:number,
    timestamp:number}[];
  soglia_superata:boolean;
  data:Date;

  regDaCompilareLoaded2: Promise<boolean>;
  filtersLoaded2: Promise<boolean>;

  trackElement(index: number, element: any) {
    return element ? element.guid : null
  }

  dateCustomClasses: DatepickerDateCustomClasses[];

  abilitaRegistro(){
    this.RegistroService.abilitaRegistro().subscribe(Ris=>{
      alert("Registro abilitato");
      this.RegistroService.getRegistro().subscribe(Ris=>{
        this.registro=Ris;
      console.log(Ris);
      this.filtersLoaded2=Promise.resolve(true);
    });

    this.LoginService.check().subscribe(Ris=>{
      console.log(Ris);
      this.registri_da_compilare=Ris.registri_da_compilare;
      this.soglia_superata=Ris.soglia_superata;
      this.regDaCompilareLoaded2=Promise.resolve(true);
      
    });
    },error => {
      console.error(error);
      alert("registro non abilitato");}
      );
  }

  onValueChange(event) {

    this.data = event;

    this.RegistroService.getRegistriMese(event.getMonth()).subscribe(res => {
      this.dateCustomClasses = [];
      res.forEach((value) => {
        let date = new Date(event);
        date.setDate(value);
          this.dateCustomClasses.push({date: date, classes: ['has_register']});
      });
    })
  }

  ngOnInit() {

    
    this.RegistroService.getRegistriMese(new Date().getMonth()).subscribe(res => {
      this.dateCustomClasses = [];
      res.forEach((value) => {
        let date = new Date();
        date.setDate(value);
          this.dateCustomClasses.push({date: date, classes: ['has_register']});
      });
    });

    this.RegistroService.getRegistro().subscribe(Ris=>{
      this.registro=Ris;
      console.log(Ris);
      
      this.filtersLoaded2=Promise.resolve(true);
      console.log(this.filtersLoaded2);

      
    },error => {
      console.error(error);
      alert("registri non presenti");
      this.filtersLoaded2=Promise.resolve(true);}
      );


      this.LoginService.check().subscribe(Ris=>{
        console.log(Ris);
        this.registri_da_compilare=Ris.registri_da_compilare;
        this.soglia_superata=Ris.soglia_superata;
        this.regDaCompilareLoaded2=Promise.resolve(true);
        
      });
  }

}
