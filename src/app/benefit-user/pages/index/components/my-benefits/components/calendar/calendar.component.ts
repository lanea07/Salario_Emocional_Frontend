import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import Swal from 'sweetalert2';

import { AuthService } from 'src/app/auth/services/auth.service';
import { BenefitUserElement } from 'src/app/benefit-user/interfaces/benefit-user.interface';
import { BenefitUserService } from 'src/app/benefit-user/services/benefit-user.service';
import { AlertService, subscriptionMessageIcon, subscriptionMessageTitle } from 'src/app/shared/services/alert-service.service';

@Component( {
  selector: 'calendar-component',
  templateUrl: './calendar.component.html',
  styles: [],
} )
export class CalendarComponent implements OnChanges, AfterViewInit {

  @ViewChild( 'calendar' ) calendar!: FullCalendarComponent;
  @Input() data?: BenefitUserElement[] = [];
  isAdmin: boolean = false;
  modalData?: any;
  visible: boolean = false;

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [ dayGridPlugin, timeGridPlugin ],
    eventClick: this.showModal.bind( this ),
    events: [],
    locale: esLocale,
    headerToolbar: {
      left: 'prev,today,next',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    showNonCurrentDates: false,
    navLinks: true,
    businessHours: {
      daysOfWeek: [ 1, 2, 3, 4, 5 ],
      startTime: '07:00',
      endTime: '17:00',
    },
    firstDay: 7,
  };

  constructor (
    private authService: AuthService,
    private as: AlertService,
    private benefitUserService: BenefitUserService,
    private elementRef: ElementRef
  ) { 
    this.authService.validarAdmin()
      .subscribe( {
        next: ( resp: any ) => {
          this.isAdmin = resp.admin;
        },
        error: ( err ) => {
          this.as.subscriptionAlert( subscriptionMessageTitle.ERROR, subscriptionMessageIcon.ERROR, err.error.message );
        }
      } );
  }

  ngOnChanges ( changes: SimpleChanges ): void {
    this.calendar?.getApi().removeAllEvents();
    this.data?.forEach( ( item: BenefitUserElement ) => {
      this.calendar?.getApi().addEvent( this.makeEvent( item ) )
    } );
    let year = new Date( Object.values( this.data! )[ 0 ]?.benefit_begin_time ).getFullYear();
    let month = new Date().getMonth() + 1;
    let day = '01';
    this.calendar?.getApi().gotoDate( `${ year }-${ month }-${ day }` );
  }

  ngAfterViewInit (): void {
    this.calendar?.getApi().removeAllEvents();
    this.data?.forEach( ( item: BenefitUserElement ) => {
      this.calendar?.getApi().addEvent( this.makeEvent( item ) )
    } );
    const event: CustomEvent = new CustomEvent<FullCalendarComponent>( 'CalendarReady', {
      bubbles: true,
      detail: this.calendar
    } );
    this.elementRef.nativeElement.dispatchEvent( event );
  }

  showModal ( arg: any ) {
    this.modalData = arg.event
    this.visible = true;
  }

  makeEvent ( eventData: BenefitUserElement ): any {
    const { id, benefit_begin_time, benefit_end_time } = eventData;
    const event = {
      id: id,
      start: new Date( benefit_begin_time ),
      end: new Date( benefit_end_time ),
      title: `${ eventData.benefits.name }`,
      classNames: [ this.classSelector( eventData.benefits.name ), 'text-dark' ],
      extendedProps: eventData,
      allDay: eventData.benefits.name === "Mis Vacaciones" ? true : false,
    };
    return event;
  }

  classSelector ( benefitName: string ) {
    switch ( benefitName ) {
      case 'Mi Cumpleaños':
        return 'bg-danger-subtle';
      case 'Mi Viernes':
        return 'bg-success-subtle';
      case 'Mi Banco de Horas':
        return 'bg-warning-subtle';
      case 'Mis Vacaciones':
        return 'bg-dark-subtle';
      default:
        return 'bg-secondary-subtle';
    }
  }

  deleteBenefit ( eventID: number ) {
    this.visible = false;
    Swal.fire( {
      title: 'Eliminar beneficio?',
      text: 'Confirme que desea eliminar el beneficio.',
      icon: 'question',
      showClass: {
        popup: 'animate__animated animate__fadeIn'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      },
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    } ).then( ( result ) => {
      if ( result.isConfirmed ) {
        this.benefitUserService.destroy( eventID )
          .subscribe( {
            next: () => {
              this.calendar.getApi().getEventById( eventID.toString() )?.remove();
            },
            error: ( err ) => { }
          } )
      }
    } );
  }

}
