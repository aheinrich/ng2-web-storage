import { Injectable } from '@angular/core';
import { IndexedDbService, IDBService } from '../storage/indexeddb.service';

@Injectable()
export class CustomerStoreService implements IDBService {

    dbName = "Customers";
    dbVersion = 1;
    schema = [
        { "name": "customers" },
        { "name": "customers-orders", "keyPath": "id" },
        { "name": "customers-shipments", "keyGenerator": { autoIncrement: true } },
        { "name": "customers-carts", "keyPath": "id", "keyGenerator": { autoIncrement: true } },
    ]
    
    db:IDBDatabase;

    constructor(private idb: IndexedDbService) {
        console.log("Hello world, I am creating the 'Customers' store database...")
        
        this.idb.openDatabase(this.dbName, this.dbVersion, this.schema).subscribe(
            (db:IDBDatabase) => {
                console.log("Got a copy of the database....")
                this.db = db
            }
        )
    }
    
    
    
}