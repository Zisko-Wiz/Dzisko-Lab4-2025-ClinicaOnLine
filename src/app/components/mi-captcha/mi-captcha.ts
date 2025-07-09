import { Component, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-mi-captcha',
  imports: [
    MatCardModule,
    FormsModule,
    MatButtonModule,
    MatInputModule
  ],
  templateUrl: './mi-captcha.html',
  styleUrl: './mi-captcha.scss'
})
export class MiCaptcha implements OnInit
{
  private captchaAnswer: string = '';
  captchaImageUrl: string = '';
  userCaptcha = '';
  protected captchaInvalido: boolean | null = null;
  respuestaCaptcha = output<boolean>();

  ngOnInit() {
    this.refreshCaptcha();
  }

  generateCaptcha(): { imageUrl: string, answer: string } {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 150;
    canvas.height = 50;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let captchaText = '';
    for (let i = 0; i < 5; i++) {
      captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.captchaAnswer = captchaText;

    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 10; i++) {
      ctx.strokeStyle = this.getRandomColor(100, 200);
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = this.getRandomColor(0, 100);
    ctx.textAlign = 'center';
    for (let i = 0; i < captchaText.length; i++) {
      ctx.save();
      ctx.translate(30 + i * 25, 25);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillText(captchaText[i], 0, 0);
      ctx.restore();
    }

    return {
      imageUrl: canvas.toDataURL(),
      answer: this.captchaAnswer
    };
  }

  validateCaptcha(userInput: string): boolean {
    return userInput === this.captchaAnswer;
  }

  private getRandomColor(min: number, max: number): string {
    const r = min + Math.floor(Math.random() * (max - min));
    const g = min + Math.floor(Math.random() * (max - min));
    const b = min + Math.floor(Math.random() * (max - min));
    return `rgb(${r},${g},${b})`;
  }

  refreshCaptcha() {
    const { imageUrl } = this.generateCaptcha();
    this.captchaImageUrl = imageUrl;
  }

  onSubmit() {
    if (!this.validateCaptcha(this.userCaptcha))
    {
      this.refreshCaptcha();
      this.captchaInvalido = true;
      this.respuestaCaptcha.emit(false);
    } else {
      this.captchaInvalido = false;
      this.respuestaCaptcha.emit(true);
    }
  }
}
