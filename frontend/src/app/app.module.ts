import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; 
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SalComponent } from './sal/sal.component';
import { GiornaleComponent } from './giornale/giornale.component';
import { RegistroComponent } from './registro/registro.component';
import { LibrettoComponent } from './libretto/libretto.component';
import { AvanzamentoComponent } from './avanzamento/avanzamento.component';
import { AddGiornaleComponent } from './add-giornale/add-giornale.component';
import {FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { CookieService } from 'ngx-cookie-service';
import { ReactiveFormsModule } from '@angular/forms';
import { UpdateGiornaleComponent } from './update-giornale/update-giornale.component';
import { VisualizzaLibrettiComponent } from './visualizza-libretti/visualizza-libretti.component';
import { VisualizzaLibrettiDittaComponent } from './visualizza-libretti-ditta/visualizza-libretti-ditta.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { VisualizzaGiornaliComponent } from './visualizza-giornali/visualizza-giornali.component';
import { VisualizzaRegistriComponent } from './visualizza-registri/visualizza-registri.component';
import { LavorazioniComponent } from './lavorazioni/lavorazioni.component';
import { VisualizzaSalComponent } from './visualizza-sal/visualizza-sal.component';
import { NullComponent } from './null/null.component';
import { AppaltoComponent } from './appalto/appalto.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SalComponent,
    GiornaleComponent,
    RegistroComponent,
    LibrettoComponent,
    AvanzamentoComponent,
    AddGiornaleComponent, 
    UpdateGiornaleComponent,
    VisualizzaLibrettiComponent,
    VisualizzaLibrettiDittaComponent,
    VisualizzaGiornaliComponent,
    VisualizzaRegistriComponent,
    LavorazioniComponent,
    VisualizzaSalComponent,
    NullComponent,
    AppaltoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ChartsModule,
    ReactiveFormsModule,
    NgxSmartModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    BrowserAnimationsModule
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
