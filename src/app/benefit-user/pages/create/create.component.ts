import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { addHours } from 'date-fns';
import { PrimeNGConfig } from 'primeng/api';
import { Calendar } from 'primeng/calendar';
import { Dropdown } from 'primeng/dropdown';

import { LoadingBarService } from '@ngx-loading-bar/core';
import { ValidatorService } from 'src/app/shared/services/validator.service';
import { UserService } from 'src/app/user/services/user.service';
import { BenefitDetail } from '../../../benefit-detail/interfaces/benefit-detail.interface';
import { Benefit } from '../../../benefit/interfaces/benefit.interface';
import { BenefitService } from '../../../benefit/services/benefit.service';
import { Dependency } from '../../../dependency/interfaces/dependency.interface';
import { AlertService, subscriptionMessageIcon, subscriptionMessageTitle } from '../../../shared/services/alert-service.service';
import { User } from '../../../user/interfaces/user.interface';
import { BenefitUser } from '../../interfaces/benefit-user.interface';
import { BenefitUserService } from '../../services/benefit-user.service';

@Component( {
  selector: 'benefitemployee-create',
  templateUrl: './create.component.html',
  styles: [
  ]
} )
export class CreateComponent implements OnInit, AfterViewInit {

  @ViewChild( 'calendar' ) calendar!: Calendar;
  @ViewChild( 'benefit' ) benefit!: Dropdown;
  es: any = {
    firstDayOfWeek: 1,
    dayNames: [ "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado" ],
    dayNamesShort: [ "dom", "lun", "mar", "mié", "jue", "vie", "sáb" ],
    dayNamesMin: [ "D", "L", "M", "X", "J", "V", "S" ],
    monthNames: [ "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre" ],
    monthNamesShort: [ "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic" ],
    today: 'Hoy',
    clear: 'Borrar'
  }

  benefits?: Benefit[];
  benefit_details?: BenefitDetail[];
  benefitDetailSpinner: boolean = true;
  createForm: FormGroup = this.fb.group( {
    benefit_begin_time: [ '' ],
    benefit_detail_id: [ { value: '', disabled: true }, Validators.required ],
    benefit_end_time: [ '' ],
    benefit_id: [ { value: '', disabled: true }, Validators.required ],
    user_id: [ '', Validators.required ],
    rangeDates: [ { value: '', disabled: true }, Validators.required ],
    request_comment: [ '' ],
  }, {
    validators: this.validatorService.maxDateGreaterThanMinDate( 'benefit_begin_time', 'benefit_end_time' )
  } );
  currentUserBenefits?: BenefitUser;
  date!: { year: number, month: number };
  dependencies!: Dependency[];
  disabledDays: number[] = [];
  disableSubmitBtn: boolean = false;
  loader = this.lbs.useRef();
  nodes!: any[];
  numberOfMonths: number = 1;
  selectedBenefitDetail?: BenefitDetail;
  user?: User;
  users?: User[];
  userAndBenefitSpinner: boolean = true;

  get userIdErrors (): string {
    const errors = this.createForm.get( 'user_id' )?.errors;
    if ( errors![ 'required' ] ) {
      return 'El campo es obligatorio';
    }
    return '';
  }

  get benefitIdErrors (): string {
    const errors = this.createForm.get( 'benefit_id' )?.errors;
    if ( errors![ 'required' ] ) {
      return 'El campo es obligatorio';
    }
    return '';
  }

  get benefitDetailIdErrors (): string {
    const errors = this.createForm.get( 'benefit_detail_id' )?.errors;
    if ( errors![ 'required' ] ) {
      return 'El campo es obligatorio';
    }
    return '';
  }

  get benefitBeginTimeErrors (): string {
    const errors = this.createForm.get( 'benefit_begin_time' )?.errors;
    if ( errors![ 'required' ] ) {
      return 'El campo es obligatorio';
    }
    if ( errors![ 'maxDateGreaterThanMinDate' ] ) {
      return 'El beneficio solicitado indica que las fechas son un rango. Asegúrate de haber seleccionado inicio y fin del beneficio solicitado';
    }
    return '';
  }

  constructor (
    private activatedRoute: ActivatedRoute,
    private as: AlertService,
    private benefitService: BenefitService,
    private benefitUserService: BenefitUserService,
    private changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private lbs: LoadingBarService,
    private pgConfig: PrimeNGConfig,
    private router: Router,
    private userService: UserService,
    private validatorService: ValidatorService,
  ) {
    this.createForm.get( 'user_id' )?.setValue( localStorage.getItem( 'uid' ) );
  }

  ngOnInit (): void {
    this.loader.start();
    this.pgConfig.setTranslation( this.es );
    combineLatest( {
      benefits: this.benefitService.indexAvailable(),
      benefitUser: this.router.url.includes( 'edit' ) ? this.activatedRoute.params.pipe(
        switchMap( ( { id } ) => this.benefitUserService.show( id ) )
      ) : of( undefined ),
      user: this.userService.show( this.createForm.get( 'user_id' )?.value )
    } )
      .subscribe( {
        next: ( { benefits, benefitUser, user } ) => {
          this.user = Object.values( user )[ 0 ];
          this.createForm.get( 'selectedNodes' )?.enable();
          this.benefits = benefits;
          this.createForm.get( 'benefit_id' )?.enable();
          this.userAndBenefitSpinner = false;
          if ( benefitUser ) {
            this.currentUserBenefits = Object.values( benefitUser )[ 0 ];
            let simulatedEvent = {
              originalEvent: {
                target: {
                  textContent: this.currentUserBenefits?.benefit_user[ 0 ].benefits.name
                }
              },
              value: this.currentUserBenefits?.benefit_user[ 0 ].benefits.id
            }
            this.fillBenefitDetail( simulatedEvent );
            this.createForm.get( 'benefit_id' )?.setValue( this.currentUserBenefits!.benefit_user[ 0 ].benefits.id );
            this.createForm.get( 'rangeDates' )?.setValue( new Date( this.currentUserBenefits!.benefit_user[ 0 ].benefit_begin_time ) );
            this.createForm.get( 'benefit_id' )?.disable();
          }
          this.loader.complete();
        },
        error: ( { error } ) => {
          this.router.navigate( [ 'basic', 'benefit-employee' ] );
          this.as.subscriptionAlert( subscriptionMessageTitle.ERROR, subscriptionMessageIcon.ERROR, error.message )
          this.loader.complete();
        }
      } );
    this.createForm.get( 'benefit_detail_id' )!.valueChanges
      .subscribe( currentBenefitDetail => {
        this.selectedBenefitDetail = this.benefit_details?.find( benefits => benefits.id === Number.parseInt( currentBenefitDetail || 0 ) );
      } );
  }

  ngAfterViewInit (): void {
    this.calendar.currentHour = new Date().getHours();
    this.calendar.currentMinute = 0;
  }

  ngAfterViewChecked (): void {
    this.changeDetectorRef.detectChanges();
  }

  isValidField ( campo: string ) {
    return this.createForm.controls[ campo ].errors
      && this.createForm.controls[ campo ].touched;
  }

  save () {

    if ( this.createForm.invalid ) {
      this.createForm.markAllAsTouched();
      return;
    }
    if ( this.currentUserBenefits?.id ) {
      this.benefitUserService.update( this.currentUserBenefits!.benefit_user[ 0 ].id, this.createForm.getRawValue() )
        .subscribe(
          {
            next: () => {
              this.disableSubmitBtn = false;
              this.as.subscriptionAlert( subscriptionMessageTitle.ACTUALIZADO, subscriptionMessageIcon.SUCCESS );
              this.createForm.get( 'user_id' )?.setValue( localStorage.getItem( 'uid' ) );
              this.router.navigate( [ '../../', 'show', this.currentUserBenefits!.benefit_user[ 0 ].id ], { relativeTo: this.activatedRoute } );
            },
            error: ( { error } ) => {
              this.disableSubmitBtn = false;
              this.as.subscriptionAlert( subscriptionMessageTitle.ERROR, subscriptionMessageIcon.ERROR, error.message );
            }
          } );
    }
    else {
      this.benefitUserService.create( this.createForm.value )
        .subscribe( {
          next: () => {
            this.disableSubmitBtn = false;
            this.as.subscriptionAlert( subscriptionMessageTitle.CREADO, subscriptionMessageIcon.SUCCESS );
            this.createForm.reset();
            this.createForm.get( 'user_id' )?.setValue( localStorage.getItem( 'uid' ) );
          },
          error: ( { error } ) => {
            this.as.subscriptionAlert( subscriptionMessageTitle.ERROR, subscriptionMessageIcon.ERROR, error.message );
            this.disableSubmitBtn = false;
          }
        } );
    }
    this.disableSubmitBtn = true;
  }

  fillBenefitDetail ( event: any ) {
    this.createForm.get( 'benefit_detail_id' )!.reset( '' );
    this.createForm.get( 'benefit_detail_id' )!.disable();
    this.createForm.get( 'rangeDates' )!.reset( '' );
    this.createForm.get( 'rangeDates' )!.disable();
    this.benefitDetailSpinner = false;
    this.benefitService.show( event.value || event )
      .subscribe(
        {
          next: ( benefit_details ) => {
            this.benefit_details = Object.values( benefit_details )[ 0 ].benefit_detail;
            if ( this.createForm.get( 'benefit_id' )!.valid ) {
              this.benefitDetailSpinner = true;
            }
            if ( this.router.url.includes( 'edit' ) ) {
              this.createForm.get( 'benefit_detail_id' )?.setValue( this.currentUserBenefits!.benefit_user[ 0 ].benefit_detail.id );
              this.createForm.get( 'request_comment' )?.setValue( this.currentUserBenefits!.benefit_user[ 0 ].request_comment );
              this.createForm.get( 'request_comment' )?.disable();
              this.benefitDetailSpinner = true;
              this.createForm.get( 'rangeDates' )!.enable();
            }
            this.createForm.get( 'benefit_detail_id' )!.enable();
          },
          error: ( { error } ) => {
            this.as.subscriptionAlert( subscriptionMessageTitle.ERROR, subscriptionMessageIcon.ERROR, error.message );
          }
        }
      );
    this.initCalendar( event );
  }

  initCalendar ( event: any ) {
    this.createForm.get( 'rangeDates' )!.reset( '' );
    let permissionName = event.originalEvent.target.textContent;
    if ( event.originalEvent && permissionName == "Mi Viernes" ) {
      this.disabledDays = [ 0, 1, 2, 3, 4, 6 ];
      this.calendar.currentHour = 13;
      this.calendar.currentMinute = 0;
    } else {
      this.disabledDays = [];
      this.calendar.currentHour = 7;
      this.calendar.currentMinute = 0;
    }
    if ( event.originalEvent && ( permissionName == "Mis Vacaciones" || permissionName == "Permiso Especial" ) ) {
      this.calendar.selectionMode = 'range'
      this.numberOfMonths = 2;
    }
    else {
      this.calendar.selectionMode = 'single'
      this.numberOfMonths = 1;
    }
    this.calendar.currentSecond = 0;
    this.calendar.updateTime();
    this.calendar.updateUI();
  }

  enableCalendar ( event: any ) {
    this.createForm.get( 'rangeDates' )!.enable();
    let benefitDetail = event.originalEvent.target.textContent;
    if ( benefitDetail === 'Tarde' ) {
      this.calendar.currentHour = 13;
      this.calendar.currentMinute = 0;
    } else {
      this.calendar.currentHour = 7;
      this.calendar.currentMinute = 0;
    }
    this.calendar.updateTime();
    this.calendar.updateUI();
  }

  setCalendarDates () {
    let date = this.createForm.get( 'rangeDates' )?.value;
    let permissionName = this.benefit.containerViewChild?.nativeElement.innerText;
    if ( date instanceof Array ) {
      let initialDate = new Date( date[ 0 ] );
      let finalDate = new Date( date[ 1 ] );
      finalDate.setDate( finalDate.getDate() + 1 );
      if ( permissionName === "Mis Vacaciones" ) {
        initialDate.setHours( 0, 0, 0, 0 );
        finalDate.setHours( 0, 0, 0, 0 );
      }
      this.createForm.get( 'benefit_begin_time' )?.setValue( initialDate );
      this.createForm.get( 'benefit_end_time' )?.setValue( finalDate );
    } else {
      this.createForm.get( 'benefit_begin_time' )?.setValue( new Date( date ) );
      this.createForm.get( 'benefit_end_time' )?.setValue( addHours( new Date( date ), this.selectedBenefitDetail!.time_hours ) );
    }
  }
}
