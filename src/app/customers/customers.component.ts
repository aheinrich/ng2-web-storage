import { Component, OnInit } from '@angular/core';
import { CustomerStoreService } from './customer-store.service'

import { Observable } from 'rxjs/Rx'

@Component({
    moduleId: module.id,
    selector: 'customers',
    styleUrls: ['customers.component.css'],
    providers: [ CustomerStoreService ],
    template: `
    <div class="customers">
        <p>I am Customers! I have my own <b>IndexedDB</b> database. As long as I am running, my associated storage service has a reference to my own database.</p>
        
        <p> (You can try, but....) You cannot delete my IndexedDB while I am still alive...</p>

        <button (click)="doGenerate()">Generate Data</button>
        
        <div class="grid">
        
            <div class="card">
                <h2>Customers</h2>
                <p>Uses basic IndexedDb w/ self-provided keys</p>
                <button (click)="doListCustomers()">List</button>
                <ul>
                    <li *ngFor="let c of customers | async ">
                        {{ c.name }} - {{ c.address }}
                    </li>
                </ul>
                
            </div>
            
            <div class="card">
                <h2>Orders</h2>
                <p>Uses IndexedDb w/ auto-generated key</p>
                <button (click)="doListOrders()">List</button>
                <ul>
                    <li *ngFor="let o of orders | async ">
                        {{ o.dateOrdered | date }} : Customer #{{ o.id }} - {{ o.items | json }}
                    </li>
                </ul>
            </div>
            
            <div class="card">
                <h2>Shipments</h2>
                <button (click)="doListShipments()">List</button>
                {{ shipments | async | json }}
            </div>
            
        </div>
    </div>`
})
export class CustomersComponent implements OnInit {
    
    customers:Observable<any>
    orders:Observable<any>
    shipments:Observable<any>
    
    constructor(private storage:CustomerStoreService) { }

    ngOnInit() {
        console.log("Hello World, I am Customers!")
    }
    
    doListCustomers() {
        this.customers = this.storage.listCustomers()
    }
    
    doListOrders() {
        this.orders = this.storage.listOrders()
    }
    
    doListShipments() {
       this.shipments = this.storage.listShipments()
    }
    
    doGenerate(){
        this.storage.generate()
    }

}