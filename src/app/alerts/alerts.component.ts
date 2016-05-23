import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertsStoreService } from './alert-store.service'

@Component({
    moduleId: module.id,
    selector: 'alerts',
    styleUrls: ['alerts.component.css'],
    providers: [ AlertsStoreService ],
    template: `
    <div class="alerts">
        <p>I am Alerts! I have my own <b>IndexedDB</b> database. As long as I am running, my associated storage service has a reference to my own database.</p>
        
        <p> You cannot delete my IndexedDB while I am still alive...</p>
        
    </div>`,
})
export class AlertsComponent implements OnInit {
    
    alerts:any
    
    constructor(private storage:AlertsStoreService) { }

    ngOnInit() {
        console.log("Hello World, I am Alert!")
    }

    ngOnDestroy(){
        this.storage.finished()
    }
}