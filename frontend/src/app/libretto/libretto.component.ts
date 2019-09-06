import { Component, OnInit } from '@angular/core';
import {LibrettoService} from '../libretto.service';
import {Router} from '@angular/router';
import {Libretto} from '../classi/Libretto';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {AppaltoService} from '../appalto.service';
import { DatepickerDateCustomClasses } from 'ngx-bootstrap/datepicker';
import { CookieService } from 'ngx-cookie-service';
import { LibrettiData } from '../classi/LibrettiData';
import { LoginService } from '../login.service';
import { check } from '../classi/check';
import { observable } from 'rxjs';
import * as FileSaver from 'file-saver';


@Component({
  selector: 'app-libretto',
  templateUrl: './libretto.component.html',
  styleUrls: ['./libretto.component.css']
})
export class LibrettoComponent implements OnInit {

  constructor(private AppaltoService:AppaltoService,public ngxSmartModalService: NgxSmartModalService,private LibrettoService: LibrettoService, private router:Router, private cookieService: CookieService, private loginService: LoginService ) { }

  filtersLoaded: Promise<boolean>;
  checkPromise: Promise<boolean>;

  libretto: LibrettiData[]; //per il libretto del giorno
  
  data: Date; //per visualizzare i libretti a tot data


  urlAllegatoAttuale : string;

  codLavoro: string;  //questi per inserire una nuova misura con il modal
  descrizione: string;
  percentuale:number;
  codLavori:string[]=[]; //conterrà i codici dei lavori esistenti
  check: check;

  newCodLavoro:string[]=[];
  newDescrizione:string[]=[];
  newPercentuale:number[]=[];

  fileToUpload: File[] = [];
  pathsOfUploadedFiles: string[] = [];
  
  dateCustomClasses: DatepickerDateCustomClasses[];

  finishLibretto(){
    this.LibrettoService.finishLibretto().subscribe(Ris=>{
     
        alert("Libretto terminato correttamente");
        this.LibrettoService.getLibretto().subscribe(Ris=>{
          this.libretto=Ris;
          console.log(this.libretto);
          this.filtersLoaded=Promise.resolve(true);},
          error => {
            console.error(error);
            this.filtersLoaded=Promise.reject();}
            );

      },error => {
        console.error(error);
        alert("libretto non terminato");}
        );
     
  }




  firma(num_libretto:number,num_rigo:number,riserva:boolean){
    let firma={
      riserva:riserva,
      num_rigo:num_rigo,
      num_libretto:num_libretto

    }
   
     this.LibrettoService.addFirma(firma).subscribe(Ris=>{
      
        alert("Firma inserita con successo");
        this.LibrettoService.getLibretto().subscribe(Ris2=>{
           this.libretto=Ris2;
           console.log(this.libretto);
           this.filtersLoaded=Promise.resolve(true);},
            error => {
            console.error(error);
             this.filtersLoaded=Promise.reject();}
                );
      this.router.navigate(['/libretto'])},
      error => {
        console.error(error);
        alert("firma non inserita");}
        );
       
      
  }

  aggiungiMisura(form){
    if(typeof this.codLavoro === 'undefined')
      {
        this.codLavoro=this.codLavori[0];
      }
      this.uploadFileToActivity( () => {

        let send={
          codLavoro:this.codLavoro,
          descrizione:form.value.descrizione,
          percentuale:form.value.percentuale,
          allegati: this.pathsOfUploadedFiles
        }

        this.pathsOfUploadedFiles.slice(0, this.pathsOfUploadedFiles.length);

        console.log(send.percentuale);
       
        this.LibrettoService.addLibretto(send).subscribe(Ris=>{
          this.fileToUpload =[]; this.pathsOfUploadedFiles = [];
          
          alert("Misura aggiunta correttamente");
          this.LibrettoService.getLibretto().subscribe(Ris=>{
            this.libretto=Ris;
          });
        },
          error => {
            console.error(error);
            alert("misura non aggiunta");}
            );
        });
     }




  updateMisura(num_rigo:number,form){
    if(typeof this.codLavoro === 'undefined')
    {
      this.codLavoro=this.codLavori[0];
    }

    this.uploadFileToActivity( () => {
      let send={
        num_libretto:this.libretto[0].num_libretto,
        num_rigo:num_rigo,
        codLavoro:form.value.newCodLavoro,
        descrizione:form.value.newDescrizione,
        percentuale:form.value.newPercentuale,
        allegati: this.pathsOfUploadedFiles
      }   

      this.pathsOfUploadedFiles.slice(0, this.pathsOfUploadedFiles.length);
      console.log(send);
      this.LibrettoService.updateLibretto(send).subscribe(Ris=>{
        alert("misura modificata correttamente");
        this.LibrettoService.getLibretto().subscribe(Ris=>{
          this.libretto=Ris;
          this.filtersLoaded=Promise.resolve(true);

          this.pathsOfUploadedFiles.slice(0, this.pathsOfUploadedFiles.length);
        })
      },
      error => {
        console.error(error);
        alert("misura non modificata");}
        );
      });

  }

  apriAllegato(url: string) {
    this.LibrettoService.getAllegato(url).subscribe((data) => {
        this.urlAllegatoAttuale = window.URL.createObjectURL(data);
        console.log(data);
        FileSaver.saveAs(this.urlAllegatoAttuale, url);
    });
  }

  trackElement(index: number, element: any) {
    return element ? element.guid : null
  }


  onValueChange(event) {

    this.data = event;

    this.LibrettoService.getLibrettiMese(event.getMonth()).subscribe(res => {
      this.dateCustomClasses = [];
      res.forEach((value) => {
        let date = new Date(event);
        date.setDate(value);
          this.dateCustomClasses.push({date: date, classes: ['has_register']});
      });
    });
  }


  handleFileInput(files: FileList) {
    for(let i = 0; i < files.length; i++)
      this.fileToUpload.push(files.item(i));
    console.log(this.fileToUpload);
  }

  uploadFileToActivity(callback: () => void ) {
    let i = 0;
    if(this.fileToUpload.length > 0) {
      for(let elem of this.fileToUpload) {
        console.log(elem);
          this.LibrettoService.postFile(elem).subscribe(data => {
            this.pathsOfUploadedFiles.push(data.path);
            if(++i == this.fileToUpload.length)
              callback();
            }, error => {
              console.log(error);
              alert("misura non inserita");
            });
          }
          
  } else callback();
  
}

  ngOnInit() {
    this.loginService.check().subscribe(res => {
        this.check = res;

        this.checkPromise = Promise.resolve(true);
    });

    this.LibrettoService.getLibrettiMese(new Date().getMonth()).subscribe(res => {
      this.dateCustomClasses = [];
      res.forEach((value) => {
        let date = new Date();
        date.setDate(value);
          this.dateCustomClasses.push({date: date, classes: ['has_register']});
      });
    })

    this.LibrettoService.getLibretto().subscribe(Ris=>{
      this.libretto=Ris;
      console.log(this.libretto);
      this.filtersLoaded=Promise.resolve(true);},
      error => {
        console.error(error);
        this.filtersLoaded=Promise.reject();}
        );

    this.AppaltoService.getLavori().subscribe(Ris=>{
      Ris.forEach((elem,index)=>{
        this.codLavori.push(elem.codLavoro);
        
      })
    });
    console.log(this.codLavori);
}
  

}
