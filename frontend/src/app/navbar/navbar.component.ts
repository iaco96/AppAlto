import { Component, OnInit, Input } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { CookieService } from 'ngx-cookie-service';
import { Router, NavigationStart } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { LoginService } from '../login.service';
import { check } from '../classi/check';
import { AlertPromise } from 'selenium-webdriver';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private LoginService:LoginService, private http: HttpClient,public ngxSmartModalService: NgxSmartModalService,private cookieService: CookieService, private router:Router) { }
 
  username:string;
  password:string;
 
  check:check;
  informazioni:{nome:string,cognome:string,ruolo:string};
  
  filtersLoaded: Promise<boolean>;
  
  login(){
    this.LoginService.login({username:this.username,password:this.password}).subscribe(Ris=>{
      this.cookieService.set('token',Ris.token);
      this.cookieService.set('nome', Ris.nome);
      this.cookieService.set('cognome', Ris.cognome);
      this.cookieService.set('ruolo', Ris.ruolo);

      this.router.navigate([this.router.url]);
      this.router.navigate(['/avanzamento']);
     
      
      this.ngxSmartModalService.getModal('log').close();
    },
    error => {
      console.error(error);
      if(error.status==302)
      alert('contratto non completato');
      else if(error.status==401)
      alert("credenziali errate")
      else if(error.status==500)
      alert("problema interno al server")
      else 
      alert("errore sconosciuto");
      this.router.navigate(['/null']);
      //this.ngxSmartModalService.getModal('log').toggle();
      this.ngxSmartModalService.getModal('log').open();

    });
   
  }


  logout(){
    this.cookieService.deleteAll();
    this.router.navigate(['/null']);
    delete this.informazioni;

    }
  
   checkInfo(){
     console.log(this.cookieService.get('token'));
     if(this.cookieService.get('token')!='' ){
        this.LoginService.info().subscribe(Ris=>{ //restituisce nome, cognome e ruolo dell'utente loggato
        this.informazioni=Ris;
        console.log(this.informazioni);
      }, 
      error => {
      console.error(error);
     // alert("verrai reindirizzato al login");
     // this.ngxSmartModalService.getModal('log').open();
      }
      );
    }else if(this.ngxSmartModalService.getOpenedModals().length<=0)

      {
      alert("verrai reindirizzato al login");
      this.ngxSmartModalService.getModal('log').open();}

  }


  checkNotifiche(){
    this.LoginService.check().subscribe(Ris=>{
      this.check=Ris;
    }, 
    error => {
      console.error(error);
    if(error.status==401)
    this.logout();
    
    }
    );

    }
  



  conta(): number{
    let somma=0;
    if(this.informazioni.ruolo=='dir' && typeof this.check.libretti!='undefined'){
      
      somma+=this.check.libretti.length;
      if(!this.check.giornale)
      {somma+=1;}

      if(this.check.soglia_superata)
      {somma+=1;}

    }

    if(this.informazioni.ruolo=='dit' && typeof this.check.libretti!='undefined'){
      somma+=this.check.libretti.length;

    }


    if(this.informazioni.ruolo=='rup' && typeof this.check.inser_terminati!='undefined' && this.check.inser_terminati){
      if(!this.check.soglia_superata){
        somma+=this.check.registri_da_compilare.length;
       }
    }

    
    if(this.informazioni.ruolo=='rup' && !this.check.inser_terminati){
      somma+=3;

    }

    return somma;


  }


  ngOnInit() {
    
   
    this.router.events.subscribe((event: any): void => {
      if (event instanceof NavigationStart) {
        if (this.cookieService.get('token') != '') {

          this.LoginService.info().subscribe(Ris => { //restituisce nome, cognome e ruolo dell'utente loggato
              this.informazioni = Ris;
              console.log(this.informazioni);

              this.LoginService.check().subscribe(Ris2 => {
                this.check = Ris2;

                if (this.check.inser_terminati != undefined && !this.check.inser_terminati && event.url !== '/appalto') {
                  this.router.navigate(['/appalto']);
                }
                this.filtersLoaded = Promise.resolve(true);
              });

            },
            error => {
              this.cookieService.deleteAll();
              
              console.error(error);
              if (event.url !== '/null') {
                this.router.navigate(['/null']);
              }
              this.informazioni = {nome: '', cognome:'', ruolo: ''};
              this.ngxSmartModalService.getModal('log').open();

              // controlla tipo di errore, se è 401 devi essere reindirizzato al login
            });

        } else if (this.ngxSmartModalService.getOpenedModals().length <= 0) {
          
          if (event.url !== '/null') {
            this.router.navigate(['/null']);
          }
          this.ngxSmartModalService.getModal('log').open();
        } 


      }

    });





  }

}
