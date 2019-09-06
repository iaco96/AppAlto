import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {sal} from './classi/sal';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root'
})
export class SalService {

  constructor(private cookieService:CookieService,private http:HttpClient) { }
  private url='http://192.168.1.74:3000/contratto/statoAvanzamentoLavori';
  
  getSal(): Observable<sal[]>{
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.get<sal[]>(this.url,{headers:header} );
  }

  getSalData(timestamp:number): Observable<sal[]>{
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    let params = new HttpParams().set('timestamp',String(timestamp));
    return this.http.get<sal[]>(this.url,{params:params,headers:header} );
  }

  abilitaSal(): Observable<HttpResponse<Object>>{
    if (confirm("Vuoi proseguire?") == true) {
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.put<HttpResponse<Object>>(this.url,{}, {headers:header} );}
    else{return new Observable<HttpResponse<Object>>(Subscriber=>{
      Subscriber.error('annullato');
    })}
  }

  getSalMese(mese: number): Observable<number[]>{
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.get<number[]>(this.url+ "?mese=" + mese,{headers:header} );
  }

  getGrafico(): Observable<{timestamp:number,numeri_sal:number,val_monetario:number}[]>{
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.get<{timestamp:number,numeri_sal:number,val_monetario:number}[]>(this.url+'/grafico',{headers:header} );

  }

}


