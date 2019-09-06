import { Component, OnInit, Input } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { LoginService } from '../login.service';
import { check } from '../classi/check';

@Component({
  selector: 'app-navbar-rup',
  templateUrl: './navbar-rup.component.html',
  styleUrls: ['./navbar-rup.component.css']
})
export class NavbarRupComponent implements OnInit {

  constructor(private LoginService:LoginService, private http: HttpClient,public ngxSmartModalService: NgxSmartModalService,private cookieService: CookieService, private router:Router) { }
 
  username:string;
  password:string;
 
  @Input() check:check;
  @Input() informazioni:{nome:string,cognome:string,ruolo:string};
  
  @Input() filtersLoaded: Promise<boolean>;
  
  login(){
    this.LoginService.login({username:this.username,password:this.password}).subscribe(Ris=>{
      this.cookieService.set('token',Ris.token);
      if(typeof this.check.inser_terminati!='undefined')
        if(this.check.inser_terminati)
           this.router.navigate(['/avanzamento']);
           else
           {this.router.navigate(['/appalto']);
           console.log('dovrei nav su appalyo');}
      
      this.ngxSmartModalService.getModal('log').close();
    },
    error => {
      console.error(error);
      if(error.status==302)
      alert('contratto non completato');
      else
      alert("credenziali errate");
      
      this.router.navigate(['/null']);
      console.log('apro modal');
      //this.ngxSmartModalService.getModal('log').toggle();
      this.ngxSmartModalService.getModal('log').open();

    });
   
  }


  logout(){
    this.cookieService.delete('token');
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

  conta(): number{
    let somma=0;
    if(this.informazioni.ruolo=='dir'){
      somma+=this.check.libretti.length;
      if(this.check.giornale)
      {somma+=1;}

      if(this.check.soglia_superata)
      {somma+=1;}

    }

    if(this.informazioni.ruolo=='dit'){
      somma+=this.check.libretti.length;

    }


    if(this.informazioni.ruolo=='rup' && this.check.inser_terminati){
      if(!this.check.soglia_superata){
        somma+=this.check.registri_da_compilare.length;
       }
    }

    
    if(this.informazioni.ruolo=='rup' && !this.check.inser_terminati){
      if(this.check.num_lavori===0){
        somma+=1;
       }
       if(this.check.soglia===0){
        somma+=1;
       }

       somma+=1;

    }

    return somma;


  }


  ngOnInit() {
    
    //setInterval(()=>{ this.checkInfo()},10000);
  
    /*if(this.cookieService.get('token')this.AppaltoService.check().subscribe(Ris=>{ //restituisce il check (vedere nella cartella classi), diverso in base all'utente connesso
      console.log(Ris);
    });*/
    //setInterval(function(){console.log(x)}, 1000); //mettere qui il check

    



  }

}
