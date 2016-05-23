import { Injectable } from '@angular/core';
import { Observable, Subscriber, Subject } from 'rxjs/Rx'

interface Datastore {
    insert(): void;
    remove(): void;
    update(): void;
    query(): void;
}

type ETransactionMode = "readwrite" | "readonly" | "versionchange"

const IDB_EVENT_UPGRADE = "upgradeneeded"
const IDB_EVENT_COMPLETE = "complete"
const IDB_EVENT_ABORT = "abort"
const IDB_EVENT_SUCCESS = "success"
const IDB_EVENT_ERROR = "error"
const IDB_EVENT_BLOCKED = "blocked"
const IDB_EVENT_VERSIONCHANGE = "versionchange"
const IDB_EVENT_CLOSE = "close"

const IDB_EVENTS = [
    IDB_EVENT_UPGRADE,
    IDB_EVENT_COMPLETE,
    IDB_EVENT_ABORT,
    IDB_EVENT_SUCCESS,
    IDB_EVENT_ERROR,
    IDB_EVENT_BLOCKED,
    IDB_EVENT_VERSIONCHANGE,
    IDB_EVENT_CLOSE
]

export interface IDBSchemaDeclaration {
    name: string,
    keyPath?: string
    keyGenerator?: any
}

export interface IDBService {
    dbName:string;
    dbVersion:number;
    schema: Array<IDBSchemaDeclaration>;
}


@Injectable()
export class IndexedDbService {

    eventStream: Subject<any>;

    constructor() {
        console.log("Service is available!")
        this.eventStream = new Subject()
        this.eventStream.subscribe(
            (event) => { },
            (error) => { },
            () => { }
        )
    }

    get events() {
        return this.eventStream.asObservable()
    }

    dropDatabase(databaseName: string) {
        return Observable.create( (observer:Subscriber<any>) => {
            let deleteRequest: IDBOpenDBRequest = window.indexedDB.deleteDatabase(databaseName)
            
            var handleSuccess = (event: Event) => {
                if (event.oldVersion > 0){
                    observer.next()
                    observer.complete()    
                } else {
                    observer.error(`Cannot find requested database '${databaseName}'`)
                }
            }
            var handleError = (event: Event) => {
                observer.error(deleteRequest.error)
            }
            var handleBlocked = (event: Event) => {
                observer.error(`Requested database '${databaseName}' is blocked`)
            }

            deleteRequest.addEventListener(IDB_EVENT_SUCCESS, handleSuccess)
            deleteRequest.addEventListener(IDB_EVENT_ERROR, handleError)
            deleteRequest.addEventListener(IDB_EVENT_BLOCKED, handleBlocked)
            return () => {
                deleteRequest.removeEventListener(IDB_EVENT_SUCCESS, handleSuccess)
                deleteRequest.removeEventListener(IDB_EVENT_ERROR, handleError)
                deleteRequest.removeEventListener(IDB_EVENT_BLOCKED, handleBlocked)
            }
        })
    }

    openDatabase(databaseName: string, version: number, schema?: Array<IDBSchemaDeclaration>) {
        return Observable.create((observer: Subscriber<any>) => {
            var openRequest: IDBOpenDBRequest = window.indexedDB.open(databaseName, version);
            var handleSuccess = (event: Event) => {
                observer.next(event.target.result)
            }
            var handleError = (event: Event) => {
                observer.error(openRequest.error)
            }
            var handleUpgrade = (event: Event) => {
                this.upgradeDatabase(observer, event.target.result, schema)
            }

            openRequest.addEventListener(IDB_EVENT_SUCCESS, handleSuccess)
            openRequest.addEventListener(IDB_EVENT_ERROR, handleError)
            openRequest.addEventListener(IDB_EVENT_UPGRADE, handleUpgrade)
            return () => {
                openRequest.removeEventListener(IDB_EVENT_SUCCESS, handleSuccess)
                openRequest.removeEventListener(IDB_EVENT_ERROR, handleError)
                openRequest.removeEventListener(IDB_EVENT_UPGRADE, handleUpgrade)
            }
        })
    }

    upgradeDatabase(observer: Subscriber<any>, database: IDBDatabase, schema: Array<IDBSchemaDeclaration>) {

        schema.forEach(schemaInstance => {
            let optionParams: IDBObjectStoreParameters = {}

            if (schemaInstance.keyPath) {
                optionParams['keyPath'] = schemaInstance.keyPath
            }

            if (schemaInstance.keyGenerator) {
                optionParams['keyGenerator'] = schemaInstance.keyGenerator
            }
            let store: IDBObjectStore = database.createObjectStore(schemaInstance.name, optionParams);
        })
        observer.next(database)
        observer.complete()
    }
    
    /**
     * When observables don't do what I expect them to do...
     */
    hardDrop(databaseName: string) {
        let deleteRequest: IDBOpenDBRequest = window.indexedDB.deleteDatabase(databaseName)
        
        deleteRequest.onsuccess = (e:Event) => {
            console.log("Success")
            console.log(e);
        }
        deleteRequest.onblocked = (e:Event) => {
            console.log("Blocked")
            console.log(e);
        }
        deleteRequest.onerror = (e:Event) => {
            console.log("Error")
            console.log(e);
        }
        deleteRequest.onupgradeneeded = (e:Event) => {
            console.log("Upgrade Needed")
            console.log(e);
        }
    }


}