import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, map } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginInfo } from '../model/loginInfo.model';


@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:8080/login'
  private token = new BehaviorSubject<boolean>(this.isTokenPresent());
  isLoggedIn$ = this.token.asObservable();

  constructor(private http: HttpClient) { }

  login(loginInfo: LoginInfo): Observable<any> {
    return this.http.post<{ token: string }>(this.apiUrl, loginInfo).pipe(
      map(response => {
        this.setToken(response.token);
        localStorage.setItem('userEmail', loginInfo.email);
        this.token.next(true);  // Aggiorna lo stato di login
        return response;
      })
    );;
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail')
    this.token.next(false);
  }

  isTokenPresent(): boolean {
    return this.getToken() !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

}