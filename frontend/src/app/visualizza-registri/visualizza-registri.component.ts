import { Component, OnInit } from '@angular/core';
import { RegistroService } from '../registro.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Registro } from '../classi/Registro';

@Component({
  selector: 'app-visualizza-registri',
  templateUrl: './visualizza-registri.component.html',
  styleUrls: ['./visualizza-registri.component.css']
})
export class VisualizzaRegistriComponent implements OnInit {

  constructor(private route: ActivatedRoute,private RegistroService:RegistroService,private router:Router) { }
  data: Date;
  registriData:Registro[];
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
    this.RegistroService.getRegistroData(data2.getTime()).subscribe(Ris=>{
      this.registriData=Ris;
      if(this.registriData.length==0){
        alert("nessun registro presente in tale data");
        this.router.navigate(['/registro']);
      }
      this.filtersLoaded=Promise.resolve(true);
    });
  }

}
