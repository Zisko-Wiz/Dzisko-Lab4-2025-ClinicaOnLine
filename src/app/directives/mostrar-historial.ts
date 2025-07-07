import { Directive, ElementRef, HostListener, inject, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appMostrarHistorial]'
})
export class MostrarHistorial {

  private el = inject(ElementRef);
  private renderer = inject(Renderer2)

  @HostListener('click') onClick()
  {
    this.renderer.setStyle(this.el.nativeElement, 'height', '100%');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'width', '20rem');
    this.renderer.setStyle(this.el.nativeElement, 'height', '3rem');
  }

}
