import { Injectable } from '@angular/core';
import { IndexedDbService, IDBService } from '../storage/indexeddb.service';

@Injectable()
export class AlertsStoreService implements IDBService {

    dbName = "Alerts";
    dbVersion = 1;
    schema = [
        { "name": "messages" },
    ]
    
    db:IDBDatabase;

    constructor(private idb: IndexedDbService) {
        console.log("Hello world, I am creating the 'Alerts' store database...")
        this.idb.openDatabase(this.dbName, this.dbVersion, this.schema).subscribe(
            (db:IDBDatabase) => {
                console.log("Got a copy of the database....")
                this.db = db
            }
        )
    }
    
    finished(){
        console.log(this.db)
        this.db.close()
    }

}