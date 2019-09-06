import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import {LibrettoService} from '../libretto.service';
import {LibrettiData} from '../classi/LibrettiData';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { CookieService } from 'ngx-cookie-service';
import {RegistroService} from '../registro.service';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-visualizza-libretti',
  templateUrl: './visualizza-libretti.component.html',
  styleUrls: ['./visualizza-libretti.component.css']
})
export class VisualizzaLibrettiComponent implements OnInit {
  
  constructor(private RegistroService:RegistroService,public ngxSmartModalService: NgxSmartModalService,private route: ActivatedRoute, private LibrettoService: LibrettoService, private router: Router, private cookieService: CookieService) { }

  filtersLoaded: Promise<boolean>;

  descrizioneRiserva: string;
  percentualeRiserva:number;
  data: Date;
  librettiData: LibrettiData[];

  urlAllegatoAttuale : string;


  addFirmaDL(num_libretto:number,num_rigo:number){
    let send={
      descrizione_riserva:this.descrizioneRiserva,
      percentuale_riserva:this.percentualeRiserva,
      num_rigo:num_rigo,
      num_libretto:num_libretto

    }
    this.LibrettoService.addFirmaDL(send).subscribe(Ris=>{
    
        alert('firmato correttamente');
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
          }
          this.filtersLoaded=Promise.resolve(true);
          
       });
      },
      error => {
        console.error(error);
        }
        );
     
  
  }


  apriAllegato(url: string) {
    this.LibrettoService.getAllegato(url).subscribe((data) => {
        this.urlAllegatoAttuale = window.URL.createObjectURL(data);
        console.log(data);
        FileSaver.saveAs(this.urlAllegatoAttuale, url);
    });
  }




  
  ngOnInit() {
    if(this.cookieService.get('ruolo') == 'dit')
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
       }
       this.filtersLoaded=Promise.resolve(true);
       
    });
  }

}
