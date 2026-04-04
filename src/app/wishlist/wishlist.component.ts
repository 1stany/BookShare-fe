import { Component, OnInit } from '@angular/core';
import { ItemType } from '../model/itemtype.model';
import { WishlistService } from '../services/wishlist.service';
import { User } from '../model/user.model';
import { RouterModule } from '@angular/router';
import { Item } from '../model/item.model';
import { UserService } from '../services/user.service';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  myWishlist : ItemType[] = [];

  constructor(private wishlistService: WishlistService){}

  ngOnInit(): void {
    this.wishlistService.getMyWishlist().subscribe(response => {
      this.myWishlist = response;
      console.log(this.myWishlist);
    })
    
  }



}

  


