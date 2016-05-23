import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'alert-details',
    template: `
    <div>
        <label>Message</label>
        <input type="text" [(ngModel)]="messageText" >
        <button (click)="doAdd()">Add</button>
    </div>`
})
export class AlertDetailsComponent implements OnInit {
    
    @Output() messages = new EventEmitter();
    
    messageText:string;
    
    constructor() { }

    ngOnInit() { }
    
    doAdd(){
        this.messages.emit({
            msg: this.messageText
        })
    }

}