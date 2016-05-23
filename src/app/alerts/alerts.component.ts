import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertsStoreService } from './alert-store.service'
import { ALERT_DIRECTIVES } from './index'

@Component({
    moduleId: module.id,
    selector: 'alerts',
    styleUrls: ['alerts.component.css'],
    providers: [ AlertsStoreService ],
    directives: [ ALERT_DIRECTIVES ],
    template: `
    <div class="alerts">
        <p>I am Alerts! I have my own <b>IndexedDB</b> database. As long as I am running, my associated storage service has a reference to my own database. You cannot delete my IndexedDB while I am still alive...</p>

        <button (click)="doList()">List</button>
        <button (click)="doDetails()">Add</button>
        
        <alert-list *ngIf="!showDetails" [messages]="alertList" ></alert-list>
        <alert-details *ngIf="showDetails" (messages)="addMessage($event);" ></alert-details>
    </div>
    
    `,
})
export class AlertsComponent implements OnInit {
    
    alertList:Array<any>;
    showDetails:boolean;
    
    constructor(private storage:AlertsStoreService) { }

    ngOnInit() {
        console.log("Hello World, I am Alert!")
        this.showDetails = false;
        this.doList()
    }

    ngOnDestroy(){
        this.storage.finished()
    }
    
    
    //
        
    doDetails(){
        this.showDetails = !this.showDetails
    }
    
    addMessage(ev:{msg:string}) {
        this.storage.insert({
            message:ev.msg
        })
        this.showDetails = false;
        this.doList()
    }
    
    doList(){
        this.alertList = []
        this.storage.list().subscribe(
            (res:any) => {
                console.log(res)
                this.alertList.push(res)
            }
        )
    }
    
}