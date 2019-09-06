import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, of, Subscriber } from 'rxjs';
import {Libretto} from './classi/Libretto';
import {LibrettiData} from './classi/LibrettiData';
import { CookieService } from 'ngx-cookie-service';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Injectable({
  providedIn: 'root'
})//172.23.181.171 192.168.1.74
export class LibrettoService {
  constructor(private ngxSmartModalService:NgxSmartModalService,private http: HttpClient,private cookieService: CookieService) { }
  private url='http://192.168.1.74:3000/contratto/librettoMisure';
  private endpoint = 'http://192.168.1.74:3000/allegati';
  private url_pr = 'http://192.168.1.74:3000/';

  addLibretto(libretto:{codLavoro:string,descrizione:string,percentuale:number, allegati: string[]}): Observable<HttpResponse<Object>>{
    /*this.ngxSmartModalService.get('control').open();
    console.log(this.ngxSmartModalService.getModalData('check'));*/
    //this.ngxSmartModalService.getModal('control').open();
    //console.log(this.ngxSmartModalService.getModalData('check'));
    if (confirm("Vuoi proseguire?") == true) {
      let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.post<HttpResponse<Object>>(this.url, libretto, {headers:header} );
  } else{return new Observable<HttpResponse<Object>>(Subscriber=>{
    Subscriber.error('annullato');
  })}
    
  }

  finishLibretto(): Observable<HttpResponse<Object>>{
    if (confirm("Vuoi proseguire?") == true) {
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.put<HttpResponse<Object>>(this.url,{}, {headers:header} );}
    else{return new Observable<HttpResponse<Object>>(Subscriber=>{
      Subscriber.error('annullato');
    })}
    
  }

  getLibretto(): Observable<LibrettiData[]>{
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.get<LibrettiData[]>(this.url,{headers:header} );
  }

  updateLibretto(libretto:{num_libretto:number, num_rigo:number, codLavoro:string,descrizione:string,percentuale:number, allegati: string[]}): Observable<HttpResponse<Object>>{
    if (confirm("Vuoi proseguire?") == true) {
     let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.post<HttpResponse<Object>>(this.url, libretto, {headers:header} );}
    else{return new Observable<HttpResponse<Object>>(Subscriber=>{
      Subscriber.error('annullato');
    })}
  }

  getLibrettoData(timestamp: number): Observable<LibrettiData[]>{
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    let params = new HttpParams().set('timestamp',String(timestamp));
    return this.http.get<LibrettiData[]>(this.url,{params:params,headers:header} );
  }

  getAllegato(url: string) : Observable <Blob> {
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));

    return this.http.get<Blob>(this.url_pr  + url, {responseType: "blob" as "json", headers:header } );
  }

  getLibrettiMese(mese: number): Observable<number[]>{
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.get<number[]>(this.url+ "?mese=" + mese,{headers:header} );
  }

  addFirma(firma:{riserva:boolean,num_rigo:number,num_libretto:number}): Observable<HttpResponse<Object>>{
    if (confirm("Vuoi proseguire?") == true) {let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.post<HttpResponse<Object>>(this.url+'/riserve', firma, {headers:header} );}
    else{return new Observable<HttpResponse<Object>>(Subscriber=>{
      Subscriber.error('annullato');
    })}
  }

  addFirmaDL(firma:{descrizione_riserva:string,percentuale_riserva:number,num_rigo:number,num_libretto}): Observable<HttpResponse<Object>>{
    if (confirm("Vuoi proseguire?") == true) { let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));
    return this.http.put<HttpResponse<Object>>(this.url+'/riserve', firma, {headers:header} );}
    else{return new Observable<HttpResponse<Object>>(Subscriber=>{
      Subscriber.error('annullato');
    })}
  }

  postFile(fileToUpload: File): Observable<{path: string}> {
    const formData: FormData = new FormData();
    let header=new HttpHeaders().set('Authorization','Bearer '+this.cookieService.get('token'));

    formData.append('fileKey', fileToUpload, fileToUpload.name);
    return this.http.put<{path: string}>(this.endpoint, formData, { headers: header });
}

}
