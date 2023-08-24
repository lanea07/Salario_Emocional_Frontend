import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';

import Swal from 'sweetalert2';

import { Position } from '../../interfaces/position.interface';
import { PositionService } from '../../services/position.service';
import { AlertService, subscriptionMessageIcon, subscriptionMessageTitle } from 'src/app/shared/services/alert-service.service';
import { Title } from '@angular/platform-browser';

@Component( {
  selector: 'position-show',
  templateUrl: './show.component.html',
  styles: [
  ]
} )
export class ShowComponent {

  loaded: boolean = false;
  position?: Position;

  constructor (
    private activatedRoute: ActivatedRoute,
    private as: AlertService,
    private positionService: PositionService,
    private router: Router,
    private titleService: Title
  ) {
    this.titleService.setTitle( 'Detalle' );
  }

  ngOnInit () {
    this.activatedRoute.params
      .pipe(
        switchMap( ( { id } ) => this.positionService.show( id ) )
      )
      .subscribe( {
        next: ( position ) => {
          this.position = position;
          this.loaded = true;
        },
        error: ( error ) => {
          this.router.navigateByUrl( 'benefit-employee' );
          Swal.fire( {
            title: 'Error',
            icon: 'error',
            html: error.error.msg,
            timer: 3000,
            timerProgressBar: true,
            didOpen: ( toast ) => {
              toast.addEventListener( 'mouseenter', Swal.stopTimer )
              toast.addEventListener( 'mouseleave', Swal.resumeTimer )
            }
          } )
        }
      } );
  }

  destroy () {
    Swal.fire( {
      title: 'Está seguro?',
      text: 'Al eliminar el usuario se eliminará todo registro de la base de datos',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Eliminar!',
      showClass: {
        popup: 'animate__animated animate__fadeIn'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    } ).then( ( result ) => {
      if ( result.isConfirmed ) {
        this.positionService.destroy( this.position?.id )
          .subscribe(
            {
              next: () => {
                this.router.navigateByUrl( '/positions' );
                this.as.subscriptionAlert( subscriptionMessageTitle.ELIMINADO, subscriptionMessageIcon.SUCCESS );
              },
              error: ( { error } ) => {
                this.as.subscriptionAlert( subscriptionMessageTitle.ERROR, subscriptionMessageIcon.ERROR, error.message );
              }
            } );
      };
    } );
  }

}
