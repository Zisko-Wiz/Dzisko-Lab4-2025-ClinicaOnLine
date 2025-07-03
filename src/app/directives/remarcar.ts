import { Directive, ElementRef, inject} from '@angular/core';

@Directive({
  selector: '[appRemarcar]'
})
export class Remarcar
{
  private el = inject(ElementRef);

  constructor()
  {
    this.el.nativeElement.style.backgroundColor = 'blue';
    this.el.nativeElement.style.color = "white";
    this.el.nativeElement.style.textAlign = 'center';
  }

}
