import { Component, OnInit, Injectable, ChangeDetectorRef, Pipe, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BenefitService } from '../../../benefit/services/benefit.service';
import { Benefit } from '../../../benefit/interfaces/benefit.interface';
import { BenefitDetail } from '../../../benefit-detail/interfaces/benefit-detail.interface';
import { tap, switchMap } from 'rxjs/operators';
import { NgbCalendar, NgbDatepicker, NgbTimeAdapter, NgbTimeStruct, NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';
import { addHours, monthsInYear } from 'date-fns';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from '../../../user/services/user.service';
import { User } from '../../../user/interfaces/user.interface';
import { AuthService } from '../../../auth/services/auth.service';
import { BenefitUserService } from '../../services/benefit-user.service';
import { BenefitUser } from '../../interfaces/benefit-user.interface';
import { forkJoin, of } from 'rxjs';

const pad = ( i: number ): string => ( i < 10 ? `0${ i }` : `${ i }` );


@Injectable()
export class NgbTimeStringAdapter extends NgbTimeAdapter<string> {
  fromModel ( value: string | null ): NgbTimeStruct | null {
    if ( !value ) {
      return null;
    }
    const split = value.split( ':' );
    return {
      hour: parseInt( split[ 0 ], 10 ),
      minute: parseInt( split[ 1 ], 10 ),
      second: parseInt( split[ 2 ], 10 ),
    };
  }

  toModel ( time: NgbTimeStruct | null ): string | null {
    return time != null ? `${ pad( time.hour ) }:${ pad( time.minute ) }:${ pad( time.second ) }` : null;
  }
}
@Component( {
  selector: 'benefitemployee-create',
  templateUrl: './create.component.html',
  styles: [
  ]
} )
export class CreateComponent implements OnInit {

  disableSubmitBtn: boolean = false;
  benefits!: Benefit[];
  benefit_details?: BenefitDetail[];
  createForm: FormGroup = this.fb.group( {
    benefit_id: [ { value: '', disabled: true }, Validators.required ],
    benefit_detail_id: [ { value: '', disabled: true }, Validators.required ],
    time: [ '', Validators.required ],
    model: [ '', Validators.required ],
    benefit_begin_time: [ '' ],
    benefit_end_time: [ '' ],
    user_id: [ { value: '', disabled: true } ]
  } );
  date!: { year: number, month: number };
  time!: { hour: number, minute: number };
  selectedBenefitDetail?: BenefitDetail;
  benefit_begin_time!: string;
  users!: User[];
  meridian: boolean = true;
  userAndBenefitSpinner: boolean = true;
  benefitDetailSpinner: boolean = true;
  currentUserBenefits?: BenefitUser;

  @ViewChild( NgbDatepicker ) dp?: NgbDatepicker;
  @ViewChild( NgbTimepicker ) tp?: NgbTimepicker;

  constructor (
    private fb: FormBuilder,
    private authService: AuthService,
    private benefitService: BenefitService,
    private benefitUserService: BenefitUserService,
    private userService: UserService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit (): void {

    forkJoin( {
      validarAdmin: this.authService.validarAdmin()
        .pipe(
          switchMap( response => {
            return response
              ? this.userService.index()
              : this.userService.show( Number.parseInt( localStorage.getItem( 'uid' )! ) );
          } )
        ),
      loadServices: this.benefitService.index()
        .pipe(
          tap( ( benefits ) => {
            this.benefits = benefits;
            this.createForm.get( 'benefit_id' )?.enable();
            this.userAndBenefitSpinner = false;
          } )
        )
    } )
      .subscribe( {
        next: ( { validarAdmin, loadServices } ) => {
          this.users = Object.values( validarAdmin );
          this.createForm.get( 'user_id' )?.enable();

          if ( this.router.url.includes( 'edit' ) ) {
            this.activatedRoute.params
              .pipe(
                switchMap( ( { id } ) => this.benefitUserService.show( id ) )
              )
              .subscribe( user => {
                this.currentUserBenefits = Object.values( user )[ 0 ];
                this.createForm.get( 'benefit_id' )?.setValue( this.currentUserBenefits!.benefit_user[ 0 ].benefits.id );
                this.dp?.navigateTo( {
                  year: new Date( this.currentUserBenefits!.benefit_user[ 0 ].benefit_begin_time ).getFullYear(),
                  month: new Date( this.currentUserBenefits!.benefit_user[ 0 ].benefit_begin_time ).getMonth() + 1
                } )
                this.createForm.get( 'model' )?.setValue( {
                  'year': new Date( this.currentUserBenefits!.benefit_user[ 0 ].benefit_begin_time ).getFullYear(),
                  'month': new Date( this.currentUserBenefits!.benefit_user[ 0 ].benefit_begin_time ).getMonth() + 1,
                  'day': new Date( this.currentUserBenefits!.benefit_user[ 0 ].benefit_begin_time ).getDate()
                } );
                this.tp?.updateHour( new Date( this.currentUserBenefits!.benefit_user[ 0 ].benefit_begin_time ).getHours().toString() );
                this.tp?.updateMinute( new Date( this.currentUserBenefits!.benefit_user[ 0 ].benefit_begin_time ).getMinutes().toString() );
                this.createForm.get( 'user_id' )?.setValue( this.currentUserBenefits!.id );
                this.fillBenefitDetail( this.currentUserBenefits!.benefit_user[ 0 ].benefits.id );
              } );
          }
        },
        error: ( error ) => {
          this.router.navigateByUrl( 'benefit-employee' );
          Swal.fire( {
            title: 'Error',
            icon: 'error',
            html: error.error.message,
            timer: 3000,
            timerProgressBar: true,
            didOpen: ( toast ) => {
              toast.addEventListener( 'mouseenter', Swal.stopTimer )
              toast.addEventListener( 'mouseleave', Swal.resumeTimer )
            }
          } )
        }
      } );

    this.createForm.get( 'benefit_detail_id' )!.valueChanges
      .subscribe( currentBenefitDetail => {
        this.selectedBenefitDetail = this.benefit_details?.find( benefits => benefits.id === Number.parseInt( currentBenefitDetail || 0 ) );
      } );

  }

  ngAfterViewChecked (): void {
    this.changeDetectorRef.detectChanges();
  }

  campoEsValido ( campo: string ) {
    return this.createForm.controls[ campo ].errors
      && this.createForm.controls[ campo ].touched;
  }

  save () {
    if ( this.createForm.invalid ) {
      this.createForm.markAllAsTouched();
      return;
    }
    let date = `${ this.createForm.get( 'model' )?.value[ 'year' ] }-${ this.createForm.get( 'model' )?.value[ 'month' ] }-${ this.createForm.get( 'model' )?.value[ 'day' ] } ${ this.createForm.get( 'time' )?.value }`;
    this.createForm.get( 'benefit_begin_time' )?.setValue( formatDate( new Date( date ), 'yyyy-MM-dd HH:mm:ss', 'en-US' ) );
    this.createForm.get( 'benefit_end_time' )?.setValue( formatDate( addHours( new Date( date ), this.selectedBenefitDetail!.time_hours ).toString(), 'yyyy-MM-dd HH:mm:ss', 'en-US' ) );

    if ( this.currentUserBenefits?.id ) {
      this.benefitUserService.update( this.currentUserBenefits!.benefit_user[ 0 ].id, this.createForm.value )
        .subscribe( resp => {
          Swal.fire( {
            title: 'Actualizado',
            icon: 'success',
            showClass: {
              popup: 'animate__animated animate__fadeIn'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
            }
          } )
        } );
    } else {
      this.benefitUserService.create( this.createForm.value )
        .subscribe( {
          next: ( resp ) => {
            Swal.fire( {
              title: 'Creado',
              text: 'Beneficio registrado',
              icon: 'success',
              showClass: {
                popup: 'animate__animated animate__fadeIn'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
              }
            } );
            // this.createForm.reset();
          }
        } );
    }
  }

  fillBenefitDetail ( event: any ) {

    this.createForm.get( 'benefit_detail_id' )!.reset( '' );
    this.benefitDetailSpinner = false;
    this.benefitService.show( event.target?.value || event )
      .subscribe( benefit_details => {
        this.benefit_details = Object.values( benefit_details )[ 0 ].benefit_detail;
        if ( this.createForm.get( 'benefit_id' )!.valid ) {
          this.benefitDetailSpinner = true;
          this.createForm.get( 'benefit_detail_id' )!.enable();
        }
        if ( this.router.url.includes( 'edit' ) ) {
          this.createForm.get( 'benefit_detail_id' )?.setValue( this.currentUserBenefits!.benefit_user[ 0 ].benefit_detail.id );
        }
      } );

  }
}
