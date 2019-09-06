import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {GiornaleService} from '../giornale.service';
import { rigoGiornale } from '../classi/rigoGiornale';

@Component({
  selector: 'app-visualizza-giornali',
  templateUrl: './visualizza-giornali.component.html',
  styleUrls: ['./visualizza-giornali.component.css']
})
export class VisualizzaGiornaliComponent implements OnInit {

  constructor(private GiornaleService:GiornaleService, private router:Router,private route: ActivatedRoute) { }

  filtersLoaded: Promise<boolean>; 
  data: Date;
  giornaliData:{ //questo è per i giornali ad una certa data
    num_giorn:number,
    timestamp: number,
    righi:rigoGiornale[]
  } [];


  ngOnInit() {
    let data2=new Date();
    this.route.params.forEach((urlParams) => {
      this.data= urlParams['data'];
    }); 

    if(typeof this.data=='undefined'){
      data2=new Date(Date.now());
    }else{
    data2=new Date(this.data);}
  

    this.GiornaleService.getGiornaleData(data2.getTime()).subscribe(ris=>{
      this.giornaliData=ris;
      this.filtersLoaded=Promise.resolve(true);
      if(this.giornaliData.length==0)
       {alert("Non ci sono giornali in tale data");
      this.router.navigate(['/giornale'])};
      },
      error => {
         console.error(error);
         this.filtersLoaded=Promise.resolve(false);}
         );
  }


}
