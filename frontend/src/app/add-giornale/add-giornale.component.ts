import { Component, OnInit } from '@angular/core';
import {Personale} from '../classi/Personale';
import {Attrezzature} from '../classi/Attrezzature';
import {GiornaleService} from '../giornale.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxSmartModalService } from 'ngx-smart-modal';
@Component({
  selector: 'app-add-giornale',
  templateUrl: './add-giornale.component.html',
  styleUrls: ['./add-giornale.component.css']
})
export class AddGiornaleComponent implements OnInit {
  constructor(private ngxSmartModalService:NgxSmartModalService,private router: Router, private GiornaleService:GiornaleService, private cookieService: CookieService) { }

  
  
  personale: Personale[];
 
  attrezzatura: Attrezzature[];
 
  descrizione: string;
  

  addPersonale(form){
    console.log(form.value);
    if(this.personale){
      this.personale.push(form.value);
    }
    else {
      this.personale= [
        {quantita: form.value.quantita,
          qualita:form.value.qualita,
          ore: form.value.ore }
      ];
    }
  }

  addAttrezzatura(form){
    console.log(form.value);
    if(this.attrezzatura){
      this.attrezzatura.push(form.value);
      }
      else{
        this.attrezzatura=[
          {nomeAtt:form.value.nomeAtt,
            quantitaAtt:form.value.quantitaAtt
            }
        ];
      }
  }


  addDescrizione(form){
    console.log(form.value);
    this.descrizione=form.value.descrizione2;
  }
 
  stampaPersonale(){
    this.personale.forEach(element =>{
      console.log(element);
    })
    console.log(this.personale);
  }

  stampaAttrezzature(){
    this.attrezzatura.forEach(element =>{
      console.log(element);
    })
    console.log(this.attrezzatura);
  }


  addGiornale(){
    let send={
      personale:this.personale,
      attrezzatura: this.attrezzatura,
      descrizione:this.descrizione
    };
    this.GiornaleService.addGiornale(send).subscribe(Result =>{
     alert("Rigo aggiunto");
     this.router.navigate(['/giornale']);
    },error => {
      console.error(error);
      alert("rigo non aggiunto");}
      );
  
  }

  ngOnInit() {
    if(this.cookieService.get('ruolo') != 'dir')
      this.router.navigate(['/giornale']);

  }

}
