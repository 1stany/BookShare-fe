import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Item } from '../model/item.model';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AddItemService {
  private apiUrl = 'http://localhost:8080/add-item';
  private categoriesUrl = 'http://localhost:8080/market/categories';
  private conditionsUrl = 'http://localhost:8080/market/conditions';

  constructor(private http: HttpClient) {}

  saveItem(item: Item): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, item);
  }

  saveItemWithFile(item: Item, file: File | null): Observable<Item> {
    const formData = new FormData();

    // Aggiungi i dati dell'item come proprietà separate (non stringificato)
    formData.append('name', item.name);
    formData.append('description', item.description);
    formData.append('activetrade', String(item.activetrade));
    formData.append('condition', item.condition);
    formData.append('conditionComment', item.conditionComment || '');
    formData.append('categoryName', item.categoryName);
    formData.append('creationDate', item.creationDate || '');
    formData.append('ownerEmail', item.ownerEmail);

    // Aggiungi il file se presente
    if (file) {
      formData.append('file', file, file.name);
    }

    console.log('FormData keys:', Array.from((formData as any).keys()));
    return this.http.post<Item>(this.apiUrl, formData);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(this.categoriesUrl).pipe(
      catchError((error) => {
        console.error('Errore caricamento categorie da backend:', error);
        return of([]);
      }),
    );
  }

  getConditions(): Observable<string[]> {
    return this.http.get<string[]>(this.conditionsUrl).pipe(
      catchError((error) => {
        console.error('Errore caricamento condizioni da backend:', error);
        return of([]);
      }),
    );
  }
}
