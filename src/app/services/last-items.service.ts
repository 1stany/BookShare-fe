import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from '../model/item.model';



@Injectable({
  providedIn: 'root'
})
export class LastItemsService {
  private apiUrl = 'http://localhost:8080/market';
  constructor(private http: HttpClient) { }
  
  getLastItems(paramsObj : any) : Observable<Item[]>{
    let params = new HttpParams();
    for(const key in paramsObj){
      if (paramsObj.hasOwnProperty(key)){
        params = params.set(key, paramsObj[key].toString());
      }
    }
    return this.http.get<[Item]>(this.apiUrl, {params});
  }

}


