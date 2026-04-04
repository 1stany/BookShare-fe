import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Trade } from '../model/trade.model';

@Injectable({
  providedIn: 'root'
})
export class TradeService {
  private apiUrl = 'http://localhost:8080/trade';

  constructor(private http: HttpClient) { }

  saveTrade(trade: Trade): Observable<Trade> {
    return this.http.post<Trade>(`${this.apiUrl}/add`, trade);
  }
}
