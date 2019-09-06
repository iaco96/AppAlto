import { Component, OnInit } from '@angular/core';
import { SalService } from '../sal.service';
import { ActivatedRoute, Router } from '@angular/router';
import {sal} from '../classi/sal';
@Component({
  selector: 'app-visualizza-sal',
  templateUrl: './visualizza-sal.component.html',
  styleUrls: ['./visualizza-sal.component.css']
})
export class VisualizzaSalComponent implements OnInit {

  constructor(private SalService:SalService,private route: ActivatedRoute,private router:Router) { }

  salData:sal[];
  data:Date;
  filtersLoaded: Promise<boolean>;
  ngOnInit() {
    let data2=new Date();
    this.route.params.forEach((urlParams) => {
      this.data= urlParams['data'];
    }); 

    
    if(typeof this.data=='undefined'){
      data2=new Date(Date.now());
    }else{
    data2=new Date(this.data);}

    this.SalService.getSalData(data2.getTime()).subscribe(Ris=>{
      this.salData=Ris;
      if(this.salData.length==0){
        alert("nessun sal presente in tale data");
        this.router.navigate(['/sal']);
      }
      this.filtersLoaded=Promise.resolve(true);
    })
  }

}
