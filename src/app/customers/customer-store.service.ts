import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx'

import { IndexedDbService, IIndexedDbService, ISchemaDeclaration } from '../storage/indexeddb.service';
import { ICustomer, ICustomerOrder, ICustomerShipment } from './customers.model'


@Injectable()
export class CustomerStoreService implements IIndexedDbService {

    dbName = "Customers";
    dbVersion = 2;
    schema:Array<ISchemaDeclaration> = [
        { "name": "customers", indexes: [
            {name:"name", key:"name"},
            {name:"email", key:"email"}
        ]},
        { "name": "customers-orders", "keyPath": "id" },
        { "name": "customers-shipments", "keyGenerator": { autoIncrement: true }, indexes: [
            {name:"name", key:"name"},
            {name:"po", key:"po"},
            {name:"date", key:"shipDate"},
        ]},
        { "name": "customers-carts", "keyPath": "id", "keyGenerator": { autoIncrement: true } },
    ]
    
    _db:IDBDatabase;

    constructor(private idbService: IndexedDbService) {
        console.log("Hello world, I am creating the 'Customers' store database...")        
    }
    
    get database(): Promise<IDBDatabase> {
        // console.log("Request for database reference...")
        if (this._db) {
            //console.log("Database is available...")
            return new Promise((res, rej) => res(this._db))
        } else {
            //console.log("Database is not yet available...")
            return this.idbService.openDatabase(this.dbName, this.dbVersion, this.schema).toPromise().then( results => {
                //console.log("Database now available")
                this._db = results
                return this._db
            })
        }
    }
    
    generate(){
        
        // Customers
        let keys:any = []
        let customerList:Array<ICustomer> = Array.apply(null, Array(100)).map((_:any, i:number)=> {
            keys.push(i)
            return {id: i, name: "Testing", address: "12345 Fake St", phone: "1234567890"}
        });

        Observable.fromPromise(this.database).mergeMap(
            (database) => {
                return this.idbService.insertBatch(database, "customers", customerList, keys)
            }
        ).subscribe();
        
        // Orders
        let orderList:Array<ICustomerOrder> = Array.apply(null, Array(50)).map((_:any, i:number)=> {
            keys.push(i)
            return {
                id: i, 
                customerId: 0, 
                dateOrdered: new Date().getTime(), 
                items: [1,2,3,4,5]
            }
        });
        Observable.fromPromise(this.database).mergeMap(
            (database) => {
                return this.idbService.insertBatch(database, "customers-orders", orderList)
            }
        ).subscribe();
        
    }
    
    
    
    listCustomers() {
        return this.list("customers").filter( (record:ICustomer) => {
            return record.id < 10
        } ).toArray()
    }

    listOrders() {
        return this.list("customers-orders").filter( (record:ICustomerOrder) => {
            return record.id < 10
        } ).toArray()
    }
    
    listShipments() {
        return this.list("customers-shipments")
    }
    
    list(storeName:string) {
        return Observable.fromPromise(this.database).mergeMap(
            (database) => {
                return this.idbService.list(database, storeName)
            }
        )
    }
    
    finished(){
        console.log(this._db)
        this._db.close()
    }
    
    
}