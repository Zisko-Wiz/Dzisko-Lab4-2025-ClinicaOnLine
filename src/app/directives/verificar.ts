import { Directive, ElementRef, inject, input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appVerificar]'
})
export class Verificar implements OnInit, OnChanges
{

  private el = inject(ElementRef);
  appVerificar = input<boolean>();

  constructor() {}
    

  ngOnInit(): void
  {
    this.changeStyle()
  }

  changeStyle()
  {
    switch (this.appVerificar())
    {
      case true:
        this.el.nativeElement.style.backgroundColor = 'green';
        break;

      case false:
        this.el.nativeElement.style.backgroundColor = 'red';
        break
    }

    this.el.nativeElement.style.color = "white";
    this.el.nativeElement.style.textAlign = 'center';
  }

  ngOnChanges(changes: SimpleChanges): void
  {
    this.changeStyle()
  }

}

