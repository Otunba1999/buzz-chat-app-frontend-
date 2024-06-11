import { animate, state, style, transition, trigger } from "@angular/animations";

export const keyPress = trigger('keypressed', [
    state('pressed', style({transform: 'scale(.9)'})),
    state('released', style({transform: 'scale(1)'})),
    transition('pressed <=> released', [animate('0.15s ease')])
])