import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { BenefitUser, BenefitUserElement } from '../interfaces/benefit-user.interface';

@Injectable( {
  providedIn: 'root'
} )
export class BenefitUserService {

  apiBaseUrl = environment.apiBaseUrl;

  constructor ( private http: HttpClient ) { }

  public index ( id: number, year: number ): Observable<BenefitUser[]> {
    return this.http.get<BenefitUser[]>( `${ this.apiBaseUrl }/benefituser?userId=${ id }&year=${ year }`, { withCredentials: true } )
  }

  public show ( id: number ): Observable<BenefitUser> {
    return this.http.get<BenefitUser>( `${ this.apiBaseUrl }/benefituser/${ id }`, { withCredentials: true } )
  }

  public create ( formValues: any ): Observable<BenefitUser> {
    return this.http.post<BenefitUser>( `${ this.apiBaseUrl }/benefituser`, formValues, { withCredentials: true } );
  }

  public update ( id: number | undefined, formValues: any ) {
    return this.http.put<BenefitUser>( `${ this.apiBaseUrl }/benefituser/${ id }`, formValues, { withCredentials: true } );
  }

  public destroy ( id: number ) {
    return this.http.delete( `${ this.apiBaseUrl }/benefituser/${ id }`, { withCredentials: true } );
  }

  public downloadReport ( formValues: any ) {
    return this.http.post( `${ this.apiBaseUrl }/exportbenefits`, formValues, { withCredentials: true } );
  }

  public indexNonApproved ( id: number ) {
    return this.http.get<BenefitUser[]>( `${ this.apiBaseUrl }/benefituser/indexnonapproved?userId=${ id }`, { withCredentials: true } )
  }

  public indexCollaboratorsNonApproved () {
    return this.http.get<BenefitUserElement[]>( `${ this.apiBaseUrl }/benefituser/indexcollaboratorsnonapproved`, { withCredentials: true } )
  }

  public indexCollaborators ( year: number ) {
    return this.http.get<BenefitUser[]>( `${ this.apiBaseUrl }/benefituser/indexcollaborators?year=${ year }`, { withCredentials: true } )
  }

  decideBenefitUser ( formValues: any ) {
    return this.http.post<any>( `${ this.apiBaseUrl }/benefituser/decidebenefituser`, formValues, { withCredentials: true } )
  }
}
