import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TabViewModule } from 'primeng/tabview';
import { TreeSelectModule } from 'primeng/treeselect';

@NgModule( {
  declarations: [],
  imports: [
    CommonModule,
    CalendarModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    PanelModule,
    TabViewModule,
    TreeSelectModule
  ],
  exports: [
    CalendarModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    PanelModule,
    TabViewModule,
    TreeSelectModule
  ]
} )
export class PrimengModule { }