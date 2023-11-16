import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgChartsModule } from 'ng2-charts';
// import { NgbTimepickerModule, NgbDatepickerModule, NgbTimeAdapter } from '@ng-bootstrap/ng-bootstrap';

import { BenefitUserRoutingModule } from './benefit-user-routing.module';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { DoughnutChartComponent } from './components/doughnut-chart/doughnut-chart.component';
import { IndexComponent } from './pages/index/index.component';
import { ShowComponent } from './pages/show/show.component';
// import { CreateComponent, NgbTimeStringAdapter } from './pages/create/create.component';
import { CreateComponent } from './pages/create/create.component';
import { TotalBancoHorasPipe } from '../shared/pipes/TotalBancoHoras.pipe';
import { DatePickerComponent } from './components/date-time-picker/date-time-picker.component';
import { NgZorroAntdModule } from '../ng-zorro/ng-zorro-antd/ng-zorro-antd.module';

@NgModule( {
  declarations: [
    BarChartComponent,
    CalendarComponent,
    CreateComponent,
    DatePickerComponent,
    DoughnutChartComponent,
    IndexComponent,
    ShowComponent,
    TotalBancoHorasPipe,
  ],
  imports: [
    BenefitUserRoutingModule,
    CalendarModule.forRoot( {
      provide: DateAdapter,
      useFactory: adapterFactory,
    } ),
    CommonModule,
    // NgbDatepickerModule,
    // NgbTimepickerModule,
    NgChartsModule,
    NgZorroAntdModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    TotalBancoHorasPipe,
    // { provide: NgbTimeAdapter, useClass: NgbTimeStringAdapter }
  ]
} )
export class BenefitEmployeeModule { }
