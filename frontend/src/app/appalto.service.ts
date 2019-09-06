import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {Lavoro} from './classi/lavoro';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import {returnStatus} from './classi/returnStatus';
import {risGetLavoro} from './classi/risGetLavoro';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AppaltoService {
//172.23.181.171  
//192.168.1.74
  private url='http://192.168.1.74:3000/appalto';


  

  addLavoro(lavoro: Lavoro): Observable<HttpResponse<Object>>{
    if (confirm("Vuoi proseguire?") == true) {
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
   return this.http.post<HttpResponse<Object>>(this.url+'/lavoro', lavoro,{headers:header});}
   else{return new Observable<HttpResponse<Object>>(Subscriber=>{
    Subscriber.error('annullato');
  })}

  }
  updateLavoro(lavoro: Lavoro): Observable<HttpResponse<Object>>{
    if (confirm("Vuoi proseguire?") == true) {
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
   return this.http.put<HttpResponse<Object>>(this.url+'/lavoro', lavoro,{headers:header});}
   else{return new Observable<HttpResponse<Object>>(Subscriber=>{
    Subscriber.error('annullato');
  })}
  }
  getLavori(): Observable<risGetLavoro[]>{
    
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.get<risGetLavoro[]>(this.url+'/lavoro', {headers:header} );
  }

  getSoglia(): Observable<{soglia : number}>{
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.get<{soglia : number}>(this.url+'/soglia', {headers:header});
  }

  /*addSoglia(soglia: number): Observable<returnStatus>{
    let params = new HttpParams().set('user','rup01');
    return this.http.post<returnStatus>(this.url+'/soglia', soglia, {params:params})
  }*/

  updateSoglia(soglia: number): Observable<HttpResponse<Object>>{
    if (confirm("Vuoi proseguire?") == true) {
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.post<HttpResponse<Object>>(this.url+'/soglia', soglia, {headers:header})}
    else{return new Observable<HttpResponse<Object>>(Subscriber=>{
      Subscriber.error('annullato');
    })}
  }

  finishSoglia(): Observable<HttpResponse<Object>>{
    if (confirm("Vuoi proseguire?") == true) {
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.put<HttpResponse<Object>>(this.url, {}, {headers:header})}
    else{return new Observable<HttpResponse<Object>>(Subscriber=>{
      Subscriber.error('annullato');
    })}
  }

 

  constructor(private http: HttpClient,private cookieService: CookieService) { }
}
