import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import {LibrettoService} from '../libretto.service';
import {LibrettiData} from '../classi/LibrettiData';
import { CookieService } from 'ngx-cookie-service';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-visualizza-libretti-ditta',
  templateUrl: './visualizza-libretti-ditta.component.html',
  styleUrls: ['./visualizza-libretti-ditta.component.css']
})
export class VisualizzaLibrettiDittaComponent implements OnInit {

  constructor(private route: ActivatedRoute, private LibrettoService: LibrettoService, private router: Router, private cookieService : CookieService) { }
  filtersLoaded: Promise<boolean>;

  
  data: Date;
  librettiData: LibrettiData[];

  urlAllegatoAttuale : string;
  
  ngOnInit() {
    if(this.cookieService.get('ruolo') != 'dit')
      this.router.navigate(["/libretto"]);

    let data2=new Date();
    this.route.params.forEach((urlParams) => {
      this.data= urlParams['data'];
    }); 
    
    if(typeof this.data=='undefined'){
      data2=new Date(Date.now());
    }else{
    data2=new Date(this.data);}
    
    this.LibrettoService.getLibrettoData(data2.getTime()).subscribe(ris=>{
       this.librettiData=ris;
       if(this.librettiData.length==0){
         alert("nessun libretto presente in tale data");
         this.router.navigate(['/libretto']);
       };
       this.filtersLoaded=Promise.resolve(true);
       });
       
      }


      apriAllegato(url: string) {
        this.LibrettoService.getAllegato(url).subscribe((data) => {
            this.urlAllegatoAttuale = window.URL.createObjectURL(data);
            console.log(data);
            FileSaver.saveAs(this.urlAllegatoAttuale, url);
        });
      }


    firma(num_libretto:number,num_rigo:number,riserva:boolean){
      let firma={
        riserva:riserva,
        num_rigo:num_rigo,
        num_libretto:num_libretto
  
      }
     
       this.LibrettoService.addFirma(firma).subscribe(Ris=>{
        
          alert("Firma inserita con successo");
           let data2=new Date();
           this.route.params.forEach((urlParams) => {
          this.data= urlParams['data'];
            }); 
    
          if(typeof this.data=='undefined'){
            data2=new Date(Date.now());
           }else{
           data2=new Date(this.data);}
    
         this.LibrettoService.getLibrettoData(data2.getTime()).subscribe(ris=>{
          this.librettiData=ris;
        this.filtersLoaded=Promise.resolve(true);
       })},
        error => {
          console.error(error);
          alert("firma non inserita");}
          );
         
        
    }

}
