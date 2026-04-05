import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
        if (i && i.cover) {
          // Puliamo il percorso come già stavi facendo
          const cleanPath = i.cover.startsWith('/')
            ? i.cover.substring(1)
            : i.cover;

          // Aggiungiamo un parametro casuale (timestamp) per distruggere la cache
          const t = new Date().getTime();
          i.cover = `http://localhost:8080/${cleanPath}?v=${t}`;
        }
        this.item = i;
        console.log('URL immagine finale:', this.item?.cover);
      });
    }
  }
}
