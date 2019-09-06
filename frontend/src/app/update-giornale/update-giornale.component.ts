import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import {Personale} from '../classi/Personale';
import {Attrezzature} from '../classi/Attrezzature';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {GiornaleService} from '../giornale.service';
import {rigoGiornale} from '../classi/rigoGiornale';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-update-giornale',
  templateUrl: './update-giornale.component.html',
  styleUrls: ['./update-giornale.component.css']
})
export class UpdateGiornaleComponent implements OnInit {

  constructor(private ngxSmartModalService:NgxSmartModalService,private route: ActivatedRoute, private GiornaleService: GiornaleService, private router: Router, private cookieService: CookieService) { }
  
  quantita: number;
  qualita: string;
  ore:number;
  personale: Personale[];

  nomeAtt: string;
  quantitaAtt: number;
  attrezzatura: Attrezzature[];

  
  descrizione: string;

  num_giorn: number;
  num_rigo: number;
  

  
  

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



  updateGiornale(){
    
    let send={
      num_giorn: this.num_giorn,
      rigo: this.num_rigo,
      personale:this.personale,
      attrezzatura: this.attrezzatura,
      descrizione:this.descrizione
    };
    console.log(send);
    this.GiornaleService.updateGiornale(send).subscribe(Result =>{
      alert("rigo modificato correttamente");
      this.router.navigate(['/giornale']);},
      error => {
        console.error(error);
        alert("rigo non modificato");}
        );
      
     
  
  }


  ngOnInit() {
    if(this.cookieService.get('ruolo') != 'dir')
      this.router.navigate(['/giornale']);

    this.route.params.forEach((urlParams) => {
      this.num_giorn= urlParams['numGiorn'];
      this.num_rigo=urlParams['numRigo'];

    }); 
  }
  }


