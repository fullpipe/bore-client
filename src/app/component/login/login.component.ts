import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/service/auth.service';
import { LoginGQL, LoginRequestGQL, Role } from 'src/generated/graphql';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  requestID: number;
  // email: string = 'asdasd@asdsad.asd';
  // code: string = '111112';
  email: string;
  code: string;
  loading = false;

  constructor(
    private loginRequestGql: LoginRequestGQL,
    private loginGql: LoginGQL,
    private auth: AuthService,
    private nav: NavController,
  ) {}

  ngOnInit() {}

  async loginRequest() {
    this.loading = true;

    try {
      this.requestID = (
        await this.loginRequestGql
          .mutate({ input: { email: this.email } })
          .toPromise()
      ).data?.loginRequest;

      console.log(this.requestID);
    } catch (error) {
      this.email = '';
    }

    this.loading = false;
  }

  async login() {
    this.loading = true;

    try {
      const pair = await this.loginGql
        .mutate({
          input: {
            code: this.code,
            requestID: this.requestID,
          },
        })
        .toPromise();

      this.auth.authenticate(pair.data.login);
      this.nav.navigateForward('books');
    } catch (error) {
      this.code = '';
    }

    this.loading = false;
  }
}
