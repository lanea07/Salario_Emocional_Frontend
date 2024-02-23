import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { er } from '@fullcalendar/core/internal-common';
import { AuthService } from 'src/app/auth/services/auth.service';
import { AlertService, subscriptionMessageIcon, subscriptionMessageTitle } from 'src/app/shared/services/alert-service.service';

@Component( {
  selector: 'update-password',
  templateUrl: './update-password.component.html',
  styles: [
  ]
} )
export class UpdatePasswordComponent {

  checkPasswords: ValidatorFn = ( group: AbstractControl ): ValidationErrors | null => {
    let pass = group.get( 'password' )?.value;
    let confirmPass = group.get( 'password_confirmation' )?.value
    this.passwordForm?.get( 'password_confirmation' )?.setErrors( { notSame: true } );
    if ( pass !== confirmPass ) {
      this.passwordForm?.get( 'password_confirmation' )?.setErrors( { notSame: true } );
      return { notSame: true }
    }
    this.passwordForm?.get( 'password_confirmation' )?.setErrors( null );
    return null;
  }

  passwordForm: FormGroup = this.fb.group( {
    current_password: [ '', [ Validators.required ] ],
    password: [ '', [ Validators.required, Validators.minLength( 6 ) ] ],
    password_confirmation: [ '', [ Validators.required ] ],
  }, { validators: this.checkPasswords } );
  loaded: boolean = true;

  get currentPasswordErrors () {
    const errors = this.passwordForm.get( 'current_password' )?.errors;
    return errors?.[ 'required' ]
      ? 'Requerido'
      : '';
  }

  get newPasswordErrors () {
    const errors = this.passwordForm.get( 'password' )?.errors;
    return errors?.[ 'required' ]
      ? 'Requerido'
      : errors?.[ 'minlength' ]
        ? 'La contraseña debe tener al menos 6 caracteres'
        : '';
  }

  get newPasswordConfirmationErrors () {
    const errors = this.passwordForm.get( 'password_confirmation' )?.errors;
    return errors?.[ 'required' ]
      ? 'Requerido'
      : errors?.[ 'minlength' ]
        ? 'La contraseña debe tener al menos 6 caracteres'
        : errors?.[ 'notSame' ]
          ? 'Las contraseñas no coinciden'
          : '';
  }

  get formErrors () {
    const errors = this.passwordForm.errors;
    return errors?.[ 'notSame' ]
      ? 'Las contraseñas no coinciden'
      : '';
  }

  constructor (
    private as: AlertService,
    private authService: AuthService,
    private fb: FormBuilder,
  ) { }

  isValidField ( campo: string ) {
    return this.passwordForm.controls[ campo ].errors
      && this.passwordForm.controls[ campo ].touched;
  }

  save () {
    if ( !this.passwordForm.valid ) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.loaded = false;
    this.authService.passwordChange( this.passwordForm.value )
      .subscribe( {
        next: ( response ) => {
          this.as.subscriptionAlert( subscriptionMessageTitle.ACTUALIZADO, subscriptionMessageIcon.SUCCESS )
          this.loaded = true;
        },
        error: ( { error } ) => this.as.subscriptionAlert( subscriptionMessageTitle.ERROR, subscriptionMessageIcon.ERROR, error.message )
      } );
  }
}
