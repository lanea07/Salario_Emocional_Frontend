import { NgModule } from '@angular/core';

import { AccordionModule } from 'primeng/accordion';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PanelModule } from 'primeng/panel';
import { SkeletonModule } from 'primeng/skeleton';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TreeSelectModule } from 'primeng/treeselect';


@NgModule( {
  declarations: [],
  imports: [],
  exports: [
    AccordionModule,
    CalendarModule,
    ChartModule,
    DialogModule,
    DropdownModule,
    DynamicDialogModule,
    InputTextareaModule,
    InputTextModule,
    PanelModule,
    SkeletonModule,
    TabMenuModule,
    TabViewModule,
    ToolbarModule,
    TooltipModule,
    TreeSelectModule,
  ]
} )
export class PrimengModule { }
