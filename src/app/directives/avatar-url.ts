import { Directive, ElementRef, HostListener, inject, input, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appAvatarURL]'
})
export class AvatarURL {

  private el = inject(ElementRef);
  private renderer = inject(Renderer2)
  appAvatarURL = input<string>();
  
  ngOnInit(): void
  {
    this.changeStyle()
  }

  changeStyle()
  {
    this.renderer.setStyle(this.el.nativeElement, 'background-image', `url(https://gehbvrlfgpqxvzcleahc.supabase.co/storage/v1/object/public/profile-pictures//${this.appAvatarURL()})`)
  }

}
