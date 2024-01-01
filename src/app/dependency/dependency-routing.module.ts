import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainContainerComponent } from '../shared/main-container/main-container.component';
import { IndexComponent } from './pages/index/index.component';
import { CreateComponent } from './pages/create/create.component';
import { ShowComponent } from './pages/show/show.component';

const routes: Routes = [ {
  path: '',
  component: MainContainerComponent,
  children: [
    { path: 'index', component: IndexComponent, title: 'Página Principal' },
    { path: 'create', component: CreateComponent, title: 'Crear Dependencia' },
    { path: 'edit/:id', component: CreateComponent, title: 'Editar Dependencia' },
    { path: 'show/:id', component: ShowComponent, title: 'Ver Dependencia' },
    { path: '**', redirectTo: 'index' }
  ]
} ];

@NgModule( {
  imports: [ RouterModule.forChild( routes ) ],
  exports: [ RouterModule ]
} )
export class DependencyRoutingModule { }