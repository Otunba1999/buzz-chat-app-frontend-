import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective {

  constructor(private elementRef: ElementRef) { }
  @Output() clickOutside = new EventEmitter<void>();

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement: HTMLElement) {
    const isClickInside = this.elementRef.nativeElement.contains(targetElement);
    if(!isClickInside)
      this.clickOutside.emit();
  }

}
