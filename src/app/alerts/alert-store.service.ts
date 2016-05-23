import { Injectable } from '@angular/core';
import { IndexedDbService, IDBService } from '../storage/indexeddb.service';
import { Observable } from 'rxjs/Rx'

@Injectable()
export class AlertsStoreService implements IDBService {

    dbName = "Alerts";
    dbVersion = 4;
    schema = [
        { "name": "messages", "keyGenerator": { autoIncrement: true } },
        { "name": "advanced_messages", "keyPath": "id" },
        { "name": "simple" },
    ]

    private _db: IDBDatabase;

    openDbPromise: Promise<any>;

    constructor(private idbService: IndexedDbService) {
        // console.log("Hello world, I am creating the 'Alerts' store database...")
    }

    /**
     * Getter - database()
     * 
     * This is a little tricky to wrap your head around initially. First, recall that everything we're trying to do with regards to IndexedDB 
     * is an asyncronous operation. As such, when a service needs to make a call to do ANYTHING with the IndexedDB, it must provide a 
     * reference to the IDBDatabase object that its' created.
     * 
     * Fetching the IDBDatabase reference is not immediate available, because the request to open a connection is asyncronous, and may not 
     * be immediately available. To deal with this, we wrap the IDBDatabase in a promise. If the instance of the IDBDatabase is available 
     * (not `undefined`) then we can simply return it. However, to keep things standardized, wrap it around a promise.
     * 
     * If the instance of the IDBDatabase is **NOT** yet defined, we need to make the OpenDatabase call. This method will take care of 
     * creating the database, with the appropriate schema if needed. Once the IDBDatabase reference is READY to be consumed, the service
     * returns it in the Observable stream, which we convert to a promise (once again... keeping things standarized). The result is stored
     * locally for consumption, and we're ready to make calls against the IDBDatabase reference.
     */
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

    /**
     * list()
     * 
     * calls IdbService.list() observable; providing the database reference and objectstore name that it would like to list. Mergemap 
     * operation against the observable to pullout the IDB reference, and that's all she wrote
     */
    list() {
        return Observable.fromPromise(this.database).mergeMap(
            (database) => {
                return this.idbService.list(database, "messages")
            }
        )
    }

    /**
     * insert()
     * 
     * calls IdbService.insert() observable;
     */
    insert(record: any) {
        record.dateAdded = new Date().getTime() / 1000
        
        return Observable.fromPromise(this.database).mergeMap(
            (database) => {
                return this.idbService.insert(database, "messages", record)
            }
        )

    }
    
    /**
     * batchInsert()
     * 
     * calls IdbService.insert() observable;
     */
    batchInsert(recordList:Array<any>) {
        recordList.forEach(record => {
            record.dateAdded = new Date().getTime() / 1000
        })
        
        return Observable.fromPromise(this.database).mergeMap(
            (database) => {
                return this.idbService.insertBatch(database, "messages", recordList)
            }
        )

    }
    
    
    /**
     * 
     */
    finished() {
        this.database.then((db: IDBDatabase) => db.close())
    }

}