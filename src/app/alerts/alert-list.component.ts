import { Component, OnInit, Input } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'alert-list',
    template: `
    <div>
        <ul>
            <li *ngFor="let m of messages">
                {{ m | json }}
            </li>
        </ul>
    </div>
    `
})
export class AlertListComponent implements OnInit {
    
    @Input() messages:Array<any>;
    
    constructor() { }

    ngOnInit() { }

}