import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TradeService } from '../services/trade.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OfferItemTradeService } from '../services/offer-item-trade.service';
import { Item } from '../model/item.model';
import { Trade } from '../model/trade.model';

@Component({
  selector: 'app-trade-add',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './trade-add.component.html',
  styleUrl: './trade-add.component.css'
})
export class TradeAddComponent implements OnInit{
  item: Item | undefined;
  requestedItem : Item | undefined;
  isSubmitted : boolean = false;

  constructor(private tradeService: TradeService, private router: Router, private route : ActivatedRoute, private offerItemTradeService : OfferItemTradeService){
    const navigation = this.router.getCurrentNavigation();
    if(navigation?.extras.state){
      this.item = navigation.extras.state['item'];
    }
  }

  ngOnInit(): void {
    this.offerItemTradeService.ownerItem$.subscribe({
      next: (i) => {
        this.item = i;
        console.log(this.item)
      }
    });
    this.offerItemTradeService.requestedItem$.subscribe({
      next: (i) => {
        this.requestedItem = i;
        console.log(this.requestedItem)
      }
    });
  }

  onSubmit(ngForm : NgForm){
    const currentTrade: Trade ={
    requestDate: new Date().toISOString().split('T')[0] ,
    accepted: false,
    exchangeDate: ngForm.value.exchangeDate,
    requestedItemId: this.requestedItem?.id!,
    exchangedItemId: this.item?.id!,
    requestingUserEmail: this.requestedItem?.ownerEmail!,
    homeUserEmail: this.item?.ownerEmail!
  }

  var alertContainer = document.getElementById('alertContainer')!;
    this.tradeService.saveTrade(currentTrade).subscribe({
      next: (resp)=>{
        this.isSubmitted = true;
        alertContainer.classList.remove('visually-hidden-focusable'), 
        console.log(currentTrade)
      },
      error: (er)=>{
        console.log(er);
        alert('Errore durante invio della richiesta');
      }
    });
  }
}
