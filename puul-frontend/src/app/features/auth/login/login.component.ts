import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.email) return;

    this.loading = true;
    this.error = '';

    this.authService.login(this.email).subscribe({
      next: () => this.router.navigate(['/users']),
      error: (err) => {
        this.error = err.error?.message?.[0] || 'Correo no encontrado';
        this.loading = false;
      }
    });
  }
}