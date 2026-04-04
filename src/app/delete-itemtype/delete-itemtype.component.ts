import { Component, OnInit } from '@angular/core';
import { ItemType } from '../model/itemtype.model';
import { WishlistService } from '../services/wishlist.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delete-itemtype',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './delete-itemtype.component.html',
  styleUrl: './delete-itemtype.component.css'
})
export class DeleteItemtypeComponent implements OnInit {

itemType! : ItemType;
itemTypeId! : number;

  constructor(private route: ActivatedRoute, private wishlistService : WishlistService, private router: Router ){}
  
  ngOnInit(): void {
    this.itemTypeId = this.route.snapshot.params['id'];
    
  }

  onDelete() {
    this.wishlistService.removeItemTypeById(this.itemTypeId).subscribe({
      next: () => this.router.navigate(['wishlist']),
      error: (err) => console.error(err)
    });
  }


}
