import { Component, OnInit } from '@angular/core';
import { CustomerStoreService } from './customer-store.service'

@Component({
    moduleId: module.id,
    selector: 'customers',
    styleUrls: ['customers.component.css'],
    providers: [ CustomerStoreService ],
    template: `
    <div class="customers">
        <p>I am Customers! I have my own <b>IndexedDB</b> database. As long as I am running, my associated storage service has a reference to my own database.</p>
        
        <p> (You can try, but....) You cannot delete my IndexedDB while I am still alive...</p>
    </div>`
})
export class CustomersComponent implements OnInit {
    constructor(private storage:CustomerStoreService) { }

    ngOnInit() {
        console.log("Hello World, I am Customers!")
    }

}