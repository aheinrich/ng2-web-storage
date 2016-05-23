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
        <button (click)="doBatch(100)">* Insert Batch 100</button>

        <alert-list *ngIf="!showDetails" [messages]="list" ></alert-list>
        <alert-details *ngIf="showDetails" (messages)="addMessage($event);" ></alert-details>
    </div>
    
    `,
})
export class AlertsComponent implements OnInit {
    
    alertList:Array<any>;
    showDetails:boolean;
    showList:boolean;
    
    constructor(private storage:AlertsStoreService) { }

    ngOnInit() {
        console.log("Hello World, I am Alert!")
        this.showDetails = false;
        this.showList = false;
        this.doList()
    }

    ngOnDestroy(){
        this.storage.finished()
    }
    
    
    //
        
    doDetails(){
        this.showDetails = !this.showDetails
    }
    
    doBatch(size:number){
        let records = Array.apply(null, Array(size)).map((_:any, i:number)=> {
            return {"message": "Alert #" + i, "value": Math.random()}
        });
        
        this.storage.batchInsert(records).subscribe()
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
                this.alertList.push(res)
            }
        )
    }
    
    get list(){
        return this.alertList.slice(0, 10)
    }
    
}