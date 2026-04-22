import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private STORAGE_KEY = 'reckitt_inventory_v3';

  initData(): Observable<any> {
    if (isPlatformBrowser(this.platformId)) {
      const localData = localStorage.getItem(this.STORAGE_KEY);
      if (localData) {
        return of(JSON.parse(localData));
      } else {
        return this.http.get<any>('assets/db.json').pipe(
          tap(data => localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data)))
        );
      }
    }
    return of({ products: [], brands: [] });
  }

  saveToPhone(data: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }
  }
}