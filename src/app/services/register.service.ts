import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user.model';
import { RegisterInfo } from '../model/register-info.model';


@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private apiUrl = 'http://localhost:8080/register'; 

  constructor(private http: HttpClient) { }

  saveUser(regInfo: RegisterInfo): Observable<User> {
    return this.http.post<User>(this.apiUrl, regInfo);
  }
}
