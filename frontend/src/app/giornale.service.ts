import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {rigoGiornale} from './classi/rigoGiornale';
import {sendGiornale} from './classi/sendGiornale';
import {sendUpdateGiornale} from './classi/sendUpdateGiornale';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class GiornaleService {
  constructor(private http: HttpClient,private cookieService: CookieService) { }
  private url='http://192.168.1.74:3000/contratto/giornaleLavori';

  addGiornale(send:sendGiornale): Observable<HttpResponse<Object>>{
    if (confirm("Vuoi proseguire?") == true) {
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.post<HttpResponse<Object>>(this.url,send,{headers:header});}
    else{return new Observable<HttpResponse<Object>>(Subscriber=>{
      Subscriber.error('annullato');
    })}
  }

  finishGiornale(): Observable<HttpResponse<Object>>{
    if (confirm("Vuoi proseguire?") == true) {
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.put<HttpResponse<Object>>(this.url,{},{headers:header});}
    else{return new Observable<HttpResponse<Object>>(Subscriber=>{
      Subscriber.error('annullato');
    })}
  }

   getGiornale(): Observable<{num_giorn:number, timestamp: number, righi:rigoGiornale[]}[]>{
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.get<{num_giorn:number,  timestamp: number, righi:rigoGiornale[]}[]>(this.url,{headers:header} );
  }

  updateGiornale(send:sendUpdateGiornale): Observable<HttpResponse<Object>>{
    if (confirm("Vuoi proseguire?") == true) {
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.post<HttpResponse<Object>>(this.url,send,{headers:header});}
    else{return new Observable<HttpResponse<Object>>(Subscriber=>{
      Subscriber.error('annullato');
    })}
  }

  getGiornaleData(timestamp: number): Observable<{num_giorn:number,  timestamp: number, righi:rigoGiornale[]}[]>{
    let params = new HttpParams().set('timestamp',String(timestamp));
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));

    return this.http.get<{num_giorn:number, timestamp: number, righi:rigoGiornale[]}[]>(this.url,{params:params,headers:header});
    
  }

  getGiornaliMese(mese: number): Observable<number[]>{
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));

    return this.http.get<number[]>(this.url + "?mese=" + mese, {headers:header});
    
  }
  
}
