import { Injectable } from '@angular/core';
import { IndexedDbService, IDBService } from '../storage/indexeddb.service';

@Injectable()
export class AlertsStoreService implements IDBService {

    dbName = "Alerts";
    dbVersion = 4;
    schema = [
        { "name": "messages", "keyGenerator": { autoIncrement: true } },
        { "name": "advanced_messages", "keyPath": "id" },
        { "name": "simple" },
    ]

    db: IDBDatabase;

    constructor(private idbService: IndexedDbService) {
        console.log("Hello world, I am creating the 'Alerts' store database...")

        this.idbService.openDatabase(this.dbName, this.dbVersion, this.schema).subscribe(
            (db: IDBDatabase) => {
                console.log("Got a copy of the database....")
                this.db = db
            }
        )
    }

    list() {
        return this.idbService.list(this.db, "messages")
    }

    insert(record: any) {
        this.idbService.insert(this.db, "messages", record);
    }

    finished() {
        console.log(this.db)
        this.db.close()
    }

}