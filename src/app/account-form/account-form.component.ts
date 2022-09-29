import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { map, Observable } from 'rxjs';
import { RestService } from '../rest.service';
import {
  AccountCreateViewModel,
  AccountUpdateViewModel,
  AccountViewModel,
  CustomerIdNamePair,
  CustomerViewModel,
} from '../_models/app.models';

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.scss'],
})
export class AccountFormComponent implements OnInit {
  form: FormGroup;
  formId = 0;
  typeList = [
    'Term',
    'Recurring',
    'Savings',
    'Current',
    'Personal_Loan',
    'Auto_Loan',
    'Credit_Card',
    'Home_Loan',
    'Overdraft',
  ];
  statusList = ['Active', 'Inactive', 'Closed', 'Dormant'];
  customerIdList$: Observable<CustomerIdNamePair[]>;

  constructor(
    private fb: FormBuilder,
    private restService: RestService,
    private toastr: ToastrService,
    private router: Router,
    private ar: ActivatedRoute
  ) {
    this.form = this.fb.group({
      id: [],
      accountNumber: ['', [Validators.required]],
      type: ['', [Validators.required]],
      rateOfInterest: ['', [Validators.required]],
      createdOn: ['', [Validators.required]],
      status: ['', [Validators.required]],
      closedOn: [],
      ifsc: [],
      cardNumber: [],
      cardActive: [],
      currency: ['', [Validators.required]],
      customer: [],
      customerId: ['', [Validators.required]],
    });

    // get the customer IDs
    this.customerIdList$ = this.restService
      .read<CustomerViewModel[]>('customers')
      .pipe(
        map((v) => {
          return v.map((c) => {
            return {
              id: c.id,
              fullName: `${c.firstName} ${c.lastName}`,
            } as CustomerIdNamePair;
          });
        })
      );

    const possibleId = +(this.ar.snapshot.paramMap.get('id') ?? '');
    this.formId = isNaN(possibleId) ? 0 : possibleId;

    //get the customer
    if (this.formId > 0) {
      this.restService
        .read<AccountViewModel>(`accounts/${this.formId}`)
        .subscribe({
          next: (res) => {
            res.createdOn = res.createdOn.split('T')[0];
            res.closedOn = res.closedOn?.split('T')[0];
            this.form.patchValue(res);
            this.toastr.success(`Account ${this.formId} loaded successfully`);
          },
          error: (error) => {
            this.toastr.error(error.message, 'Cannot process the request');
            this.router.navigate(['accounts']);
          },
        });
    }
  }

  // getters

  get id(): FormControl {
    return this.form.controls['id'] as FormControl;
  }
  get accountNumber(): FormControl {
    return this.form.controls['accountNumber'] as FormControl;
  }
  get type(): FormControl {
    return this.form.controls['type'] as FormControl;
  }
  get rateOfInterest(): FormControl {
    return this.form.controls['rateOfInterest'] as FormControl;
  }
  get createdOn(): FormControl {
    return this.form.controls['createdOn'] as FormControl;
  }
  get status(): FormControl {
    return this.form.controls['status'] as FormControl;
  }

  get closedOn(): FormControl {
    return this.form.controls['closedOn'] as FormControl;
  }
  get ifsc(): FormControl {
    return this.form.controls['ifsc'] as FormControl;
  }
  get cardNumber(): FormControl {
    return this.form.controls['cardNumber'] as FormControl;
  }
  get cardActive(): FormControl {
    return this.form.controls['cardActive'] as FormControl;
  }
  get currency(): FormControl {
    return this.form.controls['currency'] as FormControl;
  }
  get customer(): FormControl {
    return this.form.controls['customer'] as FormControl;
  }
  get customerId(): FormControl {
    return this.form.controls['customerId'] as FormControl;
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value);
      if (this.formId === 0) {
        //post
        this.restService
          .post<AccountCreateViewModel, AccountViewModel>(
            'accounts',
            this.form.value
          )
          .subscribe({
            next: (res) => {
              this.toastr.success(`Account creation success. Id = ${res.id}`);
              this.router.navigate(['accounts']);
            },
            error: (error) => {
              this.toastr.error(error.message, 'Cannot process');
            },
          });
      } else {
        //put
        this.restService
          .put<AccountUpdateViewModel, AccountViewModel>(
            `accounts/${this.formId}`,
            this.form.value
          )
          .subscribe({
            next: (res) => {
              this.toastr.success(`Account update success`);
              this.router.navigate(['accounts']);
            },
            error: (error) => {
              this.toastr.error(error.message, 'Cannot process');
            },
          });
      }
    } else {
      this.toastr.error('Invalid form');
    }
  }
}
