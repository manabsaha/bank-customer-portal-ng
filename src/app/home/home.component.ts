import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { RestService } from '../rest.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  totalAccounts$: Observable<Number>;
  totalCustomers$: Observable<Number>;
  constructor(
    public authService: AuthService,
    private restService: RestService
  ) {
    this.totalCustomers$ = this.restService.read<Number>('customers/count');
    this.totalAccounts$ = this.restService.read<Number>('accounts/count');
  }

  ngOnInit(): void {}
}
