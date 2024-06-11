import { animate, animation, style, transition, trigger } from "@angular/animations";

export const slideFromBottom = animation([
    style({transform: 'translateY(100%)'}),
    animate('0.25s ease-in', style({transform: 'translateY(0%)'}))
])