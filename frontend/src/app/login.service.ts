import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import {check} from './classi/check';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private urlLogin='http://192.168.1.74:3000/login';
  private urlCheck='http://192.168.1.74:3000/check';
  private urlInfo='http://192.168.1.74:3000/info';

  constructor(private http: HttpClient,private cookieService: CookieService) { }

  login(user:{username:string,password:string}): Observable<{token:string, nome:string, cognome:string,ruolo:string}>{
    return this.http.post<{token:string, nome:string, cognome:string,ruolo:string}>(this.urlLogin,user)
  }

  check(): Observable<check>{
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.get<check>(this.urlCheck, {headers:header});
  }

  info(): Observable<{nome:string,cognome:string,ruolo:string}>{
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.get<{nome:string,cognome:string,ruolo:string}>(this.urlInfo, {headers:header});
  }

}
