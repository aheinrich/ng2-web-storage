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

/**
 * All classes that want to use the IndexedDB storage service should implement this interface. It 
 * ensures the proper parameters are met
 * 
 *   'dbName'     - 
 *   'dbVersion'  - 
 *   'schema'     - 
 *   'finished'   -  
 */
export interface IDBService {
    dbName:string;
    dbVersion:number;
    schema: Array<IDBSchemaDeclaration>;
    finished: () => void
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
                this.logEvent(event)
                if (event.oldVersion > 0){
                    observer.next()
                    observer.complete()    
                } else {
                    observer.error(`Cannot find requested database '${databaseName}'`)
                }
            }
            var handleError = (event: Event) => {
                this.logEvent(event)
                observer.error(deleteRequest.error)
            }
            var handleBlocked = (event: Event) => {
                this.logEvent(event)
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
                this.logEvent(event)
                observer.next(event.target.result)
            }
            var handleError = (event: Event) => {
                this.logEvent(event)
                observer.error(openRequest.error)
            }
            var handleUpgrade = (event: Event) => {
                this.logEvent(event)
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
            
            if (database.objectStoreNames.contains(schemaInstance.name)){
                database.deleteObjectStore(schemaInstance.name)
            }
            
            let optionParams: IDBObjectStoreParameters = {}

            if (schemaInstance.keyPath) {
                optionParams['keyPath'] = schemaInstance.keyPath
            }

            if (schemaInstance.keyGenerator) {
                optionParams = schemaInstance.keyGenerator
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
    
    /**
     * logEvent()
     * 
     * Push an IndexedDb event to an observer stream
     */
    logEvent(e:Event){
        this.eventStream.next({
            event: event.target.constructor.name,
            type: event.type
        })
    }
    
    
    //////
      
    
    
    getTransaction(db: IDBDatabase, objectStoreNames: string[] | string, mode: ETransactionMode): IDBTransaction {
        var tnx: IDBTransaction = db.transaction(objectStoreNames, mode)
        console.log(`Transaction Created`)

        tnx.onabort = (event) => {
            console.log(`Transaction aborted`)
        }

        tnx.onerror = (event) => {
            console.log(`Transaction error`)
        }

        tnx.oncomplete = (event) => {
            console.log(`Transaction complete`)
        }

        return tnx
    }
    
    getObjectStore(tnx: IDBTransaction, objectStoreName: string): IDBObjectStore {
        var store = tnx.objectStore(objectStoreName)
        console.log(`ObjectStore Available`)

        return store
    }
    
    //////
    
    insert(db:IDBDatabase, storeName:string, record:any, key?:number):Observable<any>{
        return Observable.create( (observer:Subscriber<any>) => {
            let tnx: IDBTransaction = this.getTransaction(db, storeName, "readwrite")
            let store: IDBObjectStore = this.getObjectStore(tnx, storeName)
            let addRequest: IDBRequest = store.add(record, key);
            
            var onSuccess = (e:Event) => {
                observer.next()
                observer.complete()
            }
            
            var onError = (e:Event) => {
                observer.error()
            }
            
            return () => {
                addRequest.removeEventListener(IDB_EVENT_SUCCESS, onSuccess)
                addRequest.removeEventListener(IDB_EVENT_ERROR, onError)
            }
        })
        
    }
    
    list(db:IDBDatabase, storeName:string){
        return Observable.create( (observer:Subscriber<any>) => {
            let tnx: IDBTransaction = this.getTransaction(db, storeName, "readonly")
            let store: IDBObjectStore = this.getObjectStore(tnx, storeName)

            let cursor: IDBRequest = store.openCursor()

            cursor.onsuccess = (event: any) => {

                let iterator: IDBCursorWithValue = event.target.result;
                if (iterator) {
                    observer.next(iterator.value);
                    iterator.continue();
                } else {
                    observer.complete()
                }
            }

            cursor.onerror = (event: any) => {
                observer.error(event)
            }    
        })
        
    }


}