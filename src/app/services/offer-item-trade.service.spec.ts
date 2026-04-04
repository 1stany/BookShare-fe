import { TestBed } from '@angular/core/testing';
import { OfferItemTradeService } from './offer-item-trade.service';


describe('PreviousRouteService', () => {
  let service: OfferItemTradeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfferItemTradeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
