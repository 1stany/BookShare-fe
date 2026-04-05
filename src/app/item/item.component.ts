import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ItemService } from '../services/item.service';
import { Item } from '../model/item.model';

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './item.component.html',
  styleUrl: './item.component.css',
})
export class ItemComponent implements OnInit {
  item: Item | undefined;

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.itemService.getItem(+id).subscribe((i) => {
        if (i.cover) {
          i.cover = 'http://localhost:8080/' + i.cover;
        }
        this.item = i;
      });
    }
  }
}
