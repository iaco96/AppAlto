import {Component} from '@angular/core';
import {NgxSmartModalService} from 'ngx-smart-modal';
import {NavigationStart, Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {AppaltoService} from './appalto.service';
import {LoginService} from './login.service';
import {check} from './classi/check';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private LoginService: LoginService, public ngxSmartModalService: NgxSmartModalService, private router: Router,
              private cookieService: CookieService, private AppaltoService: AppaltoService) {
  }

  title = 'ids';
  check: check;

  informazioni: { nome: string, cognome: string, ruolo: string };
  filtersLoaded: Promise<boolean>;
  navLoaded: Promise<boolean>;
  filtersLoaded2: Promise<boolean>;

  ngOnInit() {
   /* this.router.events.subscribe((event: any): void => {
      if (event instanceof NavigationStart) {
        if (this.cookieService.get('token') != '') {

          this.LoginService.info().subscribe(Ris => { //restituisce nome, cognome e ruolo dell'utente loggato
              this.informazioni = Ris;
              console.log(this.informazioni);

              this.LoginService.check().subscribe(Ris2 => {
                this.check = Ris2;
                console.log(this.check);
                console.log(this.check.inser_terminati);
                this.navLoaded = Promise.resolve(true);

                if (this.check.inser_terminati != undefined && !this.check.inser_terminati && event.url !== '/appalto') {
                  this.router.navigate(['/appalto']);
                }
                this.filtersLoaded = Promise.resolve(true);
              });

            },
            error => {
              this.cookieService.deleteAll();
              this.navLoaded = Promise.resolve(true);
              console.error(error);
              if (event.url !== '/null') {
                this.router.navigate(['/null']);
              }
              this.ngxSmartModalService.getModal('log').open();

              // controlla tipo di errore, se è 401 devi essere reindirizzato al login
            });

        } else if (this.ngxSmartModalService.getOpenedModals().length <= 0) {
          this.navLoaded = Promise.resolve(true);
          if (event.url !== '/null') {
            this.router.navigate(['/null']);
          }
          this.ngxSmartModalService.getModal('log').open();
        } else {
          this.navLoaded = Promise.resolve(true);
        }


      }

    });
*/

  }


}