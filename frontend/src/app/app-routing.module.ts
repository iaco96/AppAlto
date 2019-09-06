import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AvanzamentoComponent } from './avanzamento/avanzamento.component';
import { GiornaleComponent } from './giornale/giornale.component';
import { SalComponent } from './sal/sal.component';
import { LibrettoComponent } from './libretto/libretto.component';
import { RegistroComponent } from './registro/registro.component';
import {AddGiornaleComponent} from './add-giornale/add-giornale.component';

import {UpdateGiornaleComponent} from './update-giornale/update-giornale.component';

import {VisualizzaLibrettiComponent} from './visualizza-libretti/visualizza-libretti.component';
import {VisualizzaLibrettiDittaComponent} from './visualizza-libretti-ditta/visualizza-libretti-ditta.component';
import{VisualizzaGiornaliComponent} from './visualizza-giornali/visualizza-giornali.component';
import {VisualizzaRegistriComponent} from './visualizza-registri/visualizza-registri.component';
import {LavorazioniComponent} from './lavorazioni/lavorazioni.component';
import {VisualizzaSalComponent} from './visualizza-sal/visualizza-sal.component';
import {NullComponent} from './null/null.component';
import { AppaltoComponent } from './appalto/appalto.component';
import { AppComponent } from './app.component';



const routes: Routes = [
  {path:'visualizzaLibrettiDitta',component:VisualizzaLibrettiDittaComponent},
  {path:'visualizzaLibrettiDitta/:data' ,component:VisualizzaLibrettiDittaComponent},
  {path:'visualizzaLibretti' ,component:VisualizzaLibrettiComponent},
  {path:'visualizzaLibretti/:data' ,component:VisualizzaLibrettiComponent},
  {path:'updateGiornale/:numGiorn/:numRigo' , component: UpdateGiornaleComponent},
  {path:'visualizzaGiornali' ,component:VisualizzaGiornaliComponent},
  {path:'visualizzaGiornali/:data' ,component:VisualizzaGiornaliComponent},
  {path:'giornale' ,component:GiornaleComponent},
  {path:'addGiornale', component: AddGiornaleComponent},
  {path:'sal' ,component:SalComponent},
  {path:'libretto' ,component:LibrettoComponent},
  {path:'lavorazioni' ,component:LavorazioniComponent},
  {path:'registro' ,component:RegistroComponent},
  {path:'visualizzaRegistri', component:VisualizzaRegistriComponent},
  {path:'visualizzaRegistri/:data' , component:VisualizzaRegistriComponent},
  {path:'visualizzaSal' , component:VisualizzaSalComponent},
  {path:'visualizzaSal/:data' , component:VisualizzaSalComponent},
  {path:'avanzamento' ,component:AvanzamentoComponent},
  {path:'null',component:NullComponent},
  {path:'appalto',component:AppaltoComponent},  //mettere un altra guard
  {path:'', redirectTo:'/avanzamento',pathMatch: 'full'},
  {path:'**', redirectTo:'/avanzamento',pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
