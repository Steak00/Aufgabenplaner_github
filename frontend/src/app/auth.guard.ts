import { Injectable, Injector, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private router: Router;

  constructor(
    private injector: Injector,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.router = this.injector.get(Router);
  }

  canActivate(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const isLoggedIn = !!localStorage.getItem('user');
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}