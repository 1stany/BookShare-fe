import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{

  constructor(private loginService: LoginService){}
  isLogged = false;

  ngOnInit(): void {
    this.loginService.isLoggedIn$.subscribe(status => {
      this.isLogged = status;
      console.log('status ' + status)
    });
  }

  onLogout(){
    this.loginService.logout();
    console.log(this.loginService.isTokenPresent());
  }

}
