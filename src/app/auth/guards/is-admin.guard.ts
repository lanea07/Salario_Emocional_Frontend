import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { forkJoin, map } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const isAdminGuard: CanMatchFn = ( route, segments ) => {
  const router: Router = inject( Router );
  const authService = inject( AuthService );
  return forkJoin( {
    isAdmin: authService.validarAdmin(),
  } )
    .pipe(
      map( ( { isAdmin } ) => {
        return isAdmin.admin || router.createUrlTree( [ 'basic', 'benefit-employee' ] );
      } )
    )
};
