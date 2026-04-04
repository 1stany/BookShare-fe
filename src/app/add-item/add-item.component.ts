import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AddItemService } from '../services/add-item.service';
import { UserService } from '../services/user.service';

import { Item } from '../model/item.model';
import { User } from '../model/user.model';
import { FullItem } from '../model/full-item.model';

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './add-item.component.html',
  styleUrl: './add-item.component.css',
})
export class AddItemComponent implements OnInit {

  isSubmitted = false;
  isAuthenticated = true;

  user: User | undefined;
  fullItem: FullItem | undefined;

  categories: string[] = [];
  conditions: string[] = ['ottimo', 'buono', 'comenuovo', 'accettabile'];
  selectedCondition: string = 'ottimo';

  coverPreview: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private userService: UserService,
    private addItemService: AddItemService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.isAuthenticated = false;
      console.warn('Utente non autenticato');
    }

    this.loadCategories();
  }

  loadCategories(): void {
    this.addItemService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Errore caricamento categorie:', err);
      }
    });
  }

  // -----------------------------
  //   COMPRESS IMAGE
  // -----------------------------
  private compressImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1920,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Errore canvas');

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) return reject('Errore compressione');

              const compressed = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });

              resolve(compressed);
            },
            file.type,
            quality
          );
        };

        img.onerror = () => reject('Errore caricamento immagine');
      };

      reader.onerror = () => reject('Errore lettura file');
    });
  }

  // -----------------------------
  //   FILE SELECTED
  // -----------------------------
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Carica solo immagini (JPEG, PNG, GIF, WebP)');
      this.resetFile(event);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Immagine troppo grande (max 5MB)');
      this.resetFile(event);
      return;
    }

    this.compressImage(file)
      .then((compressed) => {
        this.selectedFile = compressed;

        const reader = new FileReader();
        reader.onload = (e: any) => (this.coverPreview = e.target.result);
        reader.readAsDataURL(compressed);
      })
      .catch((err) => {
        console.error('Errore compressione:', err);
        this.resetFile(event);
      });
  }

  private resetFile(event: any) {
    event.target.value = '';
    this.selectedFile = null;
    this.coverPreview = null;
  }

  // -----------------------------
  //   SUBMIT FORM
  // -----------------------------
  onSubmit(ngForm: NgForm) {
    if (!this.selectedFile) {
      alert('Carica un’immagine prima di creare l’oggetto');
      return;
    }

    const activetradeValue =
      ngForm.value.activetrade === true || ngForm.value.activetrade === 'true';

    const currentItem: Item = {
      name: ngForm.value.name,
      description: ngForm.value.description,
      activetrade: activetradeValue,
      condition: ngForm.value.condition,
      conditionComment: ngForm.value.conditionComment || '',
      categoryName: ngForm.value.categoryName,
      creationDate: new Date().toISOString().split('T')[0],
      ownerEmail: localStorage.getItem('userEmail')!,
    };

    this.addItemService.saveItemWithFile(currentItem, this.selectedFile).subscribe({
      next: (resp) => {
        console.log('Item salvato:', resp);
        this.isSubmitted = true;
      },
      error: (err) => {
        console.error('Errore salvataggio:', err);
        alert('Errore durante il salvataggio (' + err.statusText + ')');
      }
    });
  }
}