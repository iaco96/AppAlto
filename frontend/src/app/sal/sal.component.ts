import { Component, OnInit } from '@angular/core';
import { AppaltoService} from '../appalto.service';
import { Router } from '@angular/router';
import {sal} from '../classi/sal';
import { SalService } from '../sal.service';
import { LoginService } from '../login.service';
import { DatepickerDateCustomClasses } from 'ngx-bootstrap/datepicker';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-sal',
  templateUrl: './sal.component.html',
  styleUrls: ['./sal.component.css']
})
export class SalComponent implements OnInit {
  
  constructor(private LoginService:LoginService,private AppaltoService:AppaltoService, private router: Router,private salService:SalService, private cookieService: CookieService) { }
  sal:sal[];
  data:Date;
  filtersLoaded: Promise<boolean>;
  soglia_superata:boolean;
  num_sal:number;
  salDaCompilareLoaded: Promise<boolean>;

  trackElement(index: number, element: any) {
    return element ? element.guid : null
  }

  
  dateCustomClasses: DatepickerDateCustomClasses[];

  abilitaSal(){
    this.salService.abilitaSal().subscribe(Ris=>{
      alert("Sal abilitato");
      this.LoginService.check().subscribe(Ris=>{
        console.log(Ris);
        this.soglia_superata=Ris.soglia_superata;
        this.num_sal=Ris.num_sal;
        this.salDaCompilareLoaded=Promise.resolve(true);
        
      });
      this.salService.getSal().subscribe(Ris=>{
        this.sal=Ris;
      console.log(Ris);
      
      this.filtersLoaded=Promise.resolve(true);
      this.salService.getSal().subscribe(Ris=>{
      this.sal=Ris;
      console.log(Ris);
      
      this.filtersLoaded=Promise.resolve(true);
    },error => {
      console.error(error);
      alert("sal non presenti");
      this.filtersLoaded=Promise.resolve(false);}
      );
      })
    },error => {
      console.error(error);
      alert("sal non abilitato");}
      );
  }

  onValueChange(event) {

    this.data = event;

    this.salService.getSalMese(event.getMonth()).subscribe(res => {
      this.dateCustomClasses = [];
      res.forEach((value) => {
        let date = new Date(event);
        date.setDate(value);
          this.dateCustomClasses.push({date: date, classes: ['has_register']});
      });
    })
  }


  ngOnInit() {

    this.LoginService.check().subscribe(Ris=>{
      console.log(Ris);
      this.soglia_superata=Ris.soglia_superata;
      this.num_sal=Ris.num_sal;
      this.salDaCompilareLoaded=Promise.resolve(true);
      
    });

    this.salService.getSalMese(new Date().getMonth()).subscribe(res => {
      this.dateCustomClasses = [];
      res.forEach((value) => {
        let date = new Date();
        date.setDate(value);
          this.dateCustomClasses.push({date: date, classes: ['has_register']});
      });
    })

    this.salService.getSal().subscribe(Ris=>{
      this.sal=Ris;
      console.log(Ris);
      
      this.filtersLoaded=Promise.resolve(true);
    },error => {
      console.error(error);
      alert("sal non presenti");
      this.filtersLoaded=Promise.resolve(false);}
      );
  }

}
