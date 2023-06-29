import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { Benefit } from '../interfaces/benefit.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable( {
    providedIn: 'root'
} )
export class BenefitService {

    apiBaseUrl = environment.apiBaseUrl;
    token = localStorage.getItem( 'token' );

    constructor ( private http: HttpClient ) { }

    index (): Observable<Benefit[]> {
        const headers = new HttpHeaders()
            .set( 'Accept', 'application/json' )
            .set( 'Authorization', `Bearer ${ this.token }` );

        this.http.get( `http://localhost:8000/sanctum/csrf-cookie` ).subscribe()
        return this.http.get<Benefit[]>( `${ this.apiBaseUrl }/benefit`, { headers, withCredentials: true } )
    }

    show ( id: number ): Observable<Benefit> {
        const headers = new HttpHeaders()
            .set( 'Accept', 'application/json' )
            .set( 'Authorization', `Bearer ${ this.token }` );

        return this.http.get<Benefit>( `${ this.apiBaseUrl }/benefit/${ id }`, { headers, withCredentials: true } )
    }

    create ( formValues: any ): Observable<Benefit> {
        const headers = new HttpHeaders()
            .set( 'Accept', 'application/json' )
            .set( 'Authorization', `Bearer ${ this.token }` );

        return this.http.post<Benefit>( `${ this.apiBaseUrl }/benefit`, formValues, { headers, withCredentials: true } );
    }

    update ( id: number | undefined, formValues: any ) {
        const headers = new HttpHeaders()
            .set( 'Accept', 'application/json' )
            .set( 'Authorization', `Bearer ${ this.token }` );

        return this.http.put<Benefit>( `${ this.apiBaseUrl }/benefit/${ id }`, formValues, { headers, withCredentials: true } );
    }

    destroy ( id: number | undefined ) {
        const headers = new HttpHeaders()
            .set( 'Accept', 'application/json' )
            .set( 'Authorization', `Bearer ${ this.token }` );

        return this.http.delete( `${ this.apiBaseUrl }/benefit/${ id }`, { headers, withCredentials: true } );
    }

}
