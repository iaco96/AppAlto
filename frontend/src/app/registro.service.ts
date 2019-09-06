import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {Registro} from './classi/Registro';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root'
})
export class RegistroService {

  private url='http://192.168.1.74:3000/contratto/registroContabilita';

  constructor(private http: HttpClient,private cookieService: CookieService) { }

  getRegistro(): Observable<Registro[]>{
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.get<Registro[]>(this.url,{headers:header} );
  }

  getRegistroData(timestamp:number): Observable<Registro[]>{
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    let params = new HttpParams().set('timestamp',String(timestamp));
    return this.http.get<Registro[]>(this.url,{params:params,headers:header} );
  }

  abilitaRegistro():Observable<HttpResponse<Object>>{
    if (confirm("Vuoi proseguire?") == true) {
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.put<HttpResponse<Object>>(this.url,{}, {headers:header} );}
    else{return new Observable<HttpResponse<Object>>(Subscriber=>{
      Subscriber.error('annullato');
    })}
  }

  getRegistriMese(mese: number): Observable<number[]>{
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.get<number[]>(this.url+ "?mese=" + mese,{headers:header} );
  }
}
