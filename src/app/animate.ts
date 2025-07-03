import { animate, query, style, transition, trigger, group } from "@angular/animations";

export const slideInAnimation2 = trigger('routeAnimations', [
  transition('home <=> ingreso', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      }),
    ], { optional: true }),
    group([
      query(':leave', [
        animate('1s ease-in-out', style({ top: '100%' }))
      ], { optional: true }),
      query(':enter', [
        style({ top: '-100%' }),
        animate('1s ease-in-out', style({ top: '0%' }))
      ], { optional: true }),
    ]),
  ]),
]);

export const slideInAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      }),
    ], { optional: true }),
    group([
      query(':leave', [
        animate('1s ease-in-out', style({ left: '100%' }))
      ], { optional: true }),
      query(':enter', [
        style({ left: '-100%' }),
        animate('1s ease-in-out', style({ left: '0%' }))
      ], { optional: true }),
    ]),
  ]),
]);