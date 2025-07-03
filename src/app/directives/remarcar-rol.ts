import { Directive, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[appRemarcarRol]'
})
export class RemarcarRol {

  private el = inject(ElementRef);
  appRemarcarRol = input<string>();

  constructor() {}
    

  ngOnInit(): void
  {
    this.changeStyle()
  }

  changeStyle()
  {
    switch (this.appRemarcarRol())
    {
      case 'paciente':
        this.el.nativeElement.style.backgroundColor = '#c095e2';
        break;

      case 'especialista':
        this.el.nativeElement.style.backgroundColor = '#5ec4db';
        break

      case 'administrador':
      this.el.nativeElement.style.backgroundColor = 'gray';
      break
    }

    this.el.nativeElement.style.color = "white";
    this.el.nativeElement.style.textAlign = 'center';
  }


}
