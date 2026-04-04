import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { City } from '../model/city.model';

@Injectable({
  providedIn: 'root',
})
export class CityService {
  private citiesUrl = 'http://localhost:8080/market/cities';

  constructor(private http: HttpClient) {}

  getCities(): Observable<City[]> {
    return this.http.get<City[]>(this.citiesUrl).pipe(
      catchError((error) => {
        console.error('Errore nel caricamento delle città:', error);
        return of([]);
      }),
    );
  }
}
