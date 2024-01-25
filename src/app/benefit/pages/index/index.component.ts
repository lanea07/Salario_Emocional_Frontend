import { AfterViewInit, Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

import { AlertService, subscriptionMessageIcon, subscriptionMessageTitle } from 'src/app/shared/services/alert-service.service';
import es_CO from '../../../shared/Datatables-langs/es-CO.json';
import { BenefitService } from '../../services/benefit.service';

@Component( {
  selector: 'benefit-index',
  templateUrl: './index.component.html',
  styles: [
  ]
} )
export class IndexComponent implements OnInit, AfterViewInit {

  columns = [
    { title: 'Nombre', data: 'name' },
    {
      title: 'Opciones',
      data: function ( data: any, type: any, full: any ) {
        return `
          <span style="cursor: pointer;" benefit_id="${ data.id }" class="badge rounded-pill text-bg-warning">
            Detalles
            <i class="fa-solid fa-circle-info fa-fade" style="color: #000000;"></i>
          </span>`;
      }
    }
  ];
  dtOptions: any;

  constructor (
    private as: AlertService,
    private benefitService: BenefitService,
    private renderer: Renderer2,
    private router: Router,
  ) { }

  ngOnInit () {
    this.dtOptions = {
      ajax: ( dataTablesParameters: any, callback: any ) => {
        this.benefitService.index().subscribe( {
          next: ( benefits ) => {
            callback( { data: benefits } );
          },
          error: ( err ) => {
            this.router.navigateByUrl( 'benefit-employee' );
            this.as.subscriptionAlert( subscriptionMessageTitle.ERROR, subscriptionMessageIcon.ERROR, err.error.message )
          }
        } );
      },
      columns: this.columns,
      responsive: true,
      language: es_CO,
      createdRow: function ( row: any, data: any, dataIndex: any, cells: any ) {
        if ( !data.valid_id ) {
          $( row ).addClass( 'invalid-user' );
        };
      }
    }
  }

  ngAfterViewInit (): void {
    this.renderer.listen( 'document', 'click', ( event ) => {
      if ( event.target.hasAttribute( "benefit_id" ) ) {
        this.router.navigate( [ "/benefit/show/" + event.target.getAttribute( "benefit_id" ) ] );
      }
    } );
  }

}
