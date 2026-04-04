import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Item } from '../model/item.model';

@Injectable({
  providedIn: 'root'
})
export class OfferItemTradeService {
  private itemSubject = new BehaviorSubject<Item | undefined>(undefined);
  ownerItem$ = this.itemSubject.asObservable();

  private requestedItemSubject = new BehaviorSubject<Item | undefined>(undefined);
  requestedItem$ = this.requestedItemSubject.asObservable();

  constructor() { }

  setItemSubject(item: Item) {
    this.itemSubject.next(item);
  }

  setRequestedItemSubject(item: Item) {
    this.requestedItemSubject.next(item);
  }

}
