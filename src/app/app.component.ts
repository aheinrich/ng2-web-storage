import { Component, OnInit } from '@angular/core';
import { Routes, Router, ROUTER_DIRECTIVES } from '@angular/router';
import { IndexedDbService } from './storage/indexeddb.service'

import { AlertsComponent } from './alerts/alerts.component'
import { CustomersComponent } from './customers/customers.component'

@Component({
    moduleId: module.id,
    selector: 'app',
    styleUrls: ['app.component.css'],
    templateUrl: 'app.component.html',
    directives: [ROUTER_DIRECTIVES, AlertsComponent, CustomersComponent],
    providers: [ IndexedDbService ]
})
@Routes([
])

export class AppComponent implements OnInit {
    
    customers: boolean;
    alerts: boolean;
    events:Array<any> = []
    dropDbName:string;
    
    constructor(private router: Router, private idb:IndexedDbService) {}

    ngOnInit() {
        this.customers = false;
        this.alerts = false;
        this.idb.events.subscribe( e => {
            this.events.push(e)
        })
    }
    
    doAlerts(){
        this.alerts = !this.alerts
    }
    
    doCustomers(){
        this.customers = !this.customers
    }
    
    doDropDb(dbName:string){
        this.idb.dropDatabase(dbName).subscribe(
            (result:any) => {
                alert("Success")
            },
            (error:any) => {
                alert(error)
            }
        )
        // this.idb.hardDrop(dbName)
    }

}