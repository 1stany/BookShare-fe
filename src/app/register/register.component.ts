import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RegisterService } from '../services/register.service';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../model/user.model';
import { City } from '../model/city.model';
import { RegisterInfo } from '../model/register-info.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { merge } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CityService } from '../services/city.service';

@Component({
  selector: 'app-register',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm: FormGroup;
  maxDate: Date;
  hide = signal(true);
  errorMessage = signal('');
  cities: City[] = [];

  constructor(
    private registerService: RegisterService,
    private router: Router,
    private fb: FormBuilder,
    private cityService: CityService,
  ) {
    this.cityService.getCities().subscribe((c) => (this.cities = c));
    this.registerForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: [''],
      city: ['', Validators.required],
      gender: ['', Validators.required],
      date: ['', Validators.required],
      password: ['', Validators.required],
      description: [''],
      privacyAccepted: [false, Validators.requiredTrue],
    });

    const emailControl = this.registerForm.get('email')!;
    merge(emailControl.statusChanges, emailControl.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage(emailControl));

    const today = new Date();
    this.maxDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate(),
    );
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  myFilter = (d: Date | null): boolean => {
    const date = d || new Date();
    return date <= this.maxDate;
  };

  updateErrorMessage(emailControl: AbstractControl) {
    if (emailControl.hasError('required')) {
      this.errorMessage.set("L'email è obbligatoria");
    } else if (emailControl.hasError('email')) {
      this.errorMessage.set("L'email non è valida");
    } else {
      this.errorMessage.set('');
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const currentUser: User = {
        firstname: this.registerForm.value.firstname,
        lastname: this.registerForm.value.lastname,
        email: this.registerForm.value.email,
        phone: this.registerForm.value.phone,
        cityName: this.registerForm.value.city,
        gender: this.registerForm.value.gender,
        birthdate: this.formatDate(this.registerForm.value.date),
        description: this.registerForm.value.description,
      };

      const registerInfo: RegisterInfo = {
        user: currentUser,
        password: this.registerForm.value.password,
      };

      this.registerService.saveUser(registerInfo).subscribe({
        next: (resp) => this.router.navigate(['/login']),
        error: (er) => console.log(er),
      });
    }
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${year}-${month}-${day}`;
  }
}
