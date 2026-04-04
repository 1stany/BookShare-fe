import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Item } from '../model/item.model';
import { LoginService } from './login.service';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8080/market/user';
  private userUrl = 'http://localhost:8080/user';

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
  ) {}

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/item`);
  }

  getUserDetails(): Observable<any> {
    return this.http.get<User>(this.userUrl);
  }

  updateCity(cityId: number): Observable<User> {
    return this.http.put<User>(`${this.userUrl}/city?cityId=${cityId}`, {});
  }
}
