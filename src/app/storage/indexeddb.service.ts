import { Injectable } from '@angular/core';
import { Observable, Subscriber, Subject } from 'rxjs/Rx'

type ETransactionMode = "readwrite" | "readonly" | "versionchange"

const IDB_EVENT_UPGRADE = "upgradeneeded"
const IDB_EVENT_COMPLETE = "complete"
const IDB_EVENT_ABORT = "abort"
const IDB_EVENT_SUCCESS = "success"
const IDB_EVENT_ERROR = "error"
const IDB_EVENT_BLOCKED = "blocked"
const IDB_EVENT_VERSIONCHANGE = "versionchange"
const IDB_EVENT_CLOSE = "close"

export interface ISchemaDeclaration {
    name: string,
    keyPath?: string
    keyGenerator?: any
    indexes?: Array<IIndexParams>
}

export interface IIndexParams {
    name: string
    key: string
    optionalParameters?: {
        unique?:boolean,
        multiEntry?:boolean,
        locale?:string
    }
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
export interface IIndexedDbService {
    dbName:string;
    dbVersion:number;
    schema: Array<ISchemaDeclaration>;
    finished: () => void
}


@Injectable()
export class IndexedDbService {

    eventStream: Subject<any>;
    indexedDB:any;
    
    constructor() {
        this.eventStream = new Subject()
        this.eventStream.subscribe(
            (ev) => { },
            (err) => { },
            () => { }
        )
        
        this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    }

    get events() {
        return this.eventStream.asObservable()
    }

    dropDatabase(databaseName: string) {
        return Observable.create( (observer:Subscriber<any>) => {
            let deleteRequest: IDBOpenDBRequest = this.indexedDB.deleteDatabase(databaseName)
            
            var handleSuccess = (ev: Event) => {
                this.logEvent('dropDatabase', ev)
                if (ev.oldVersion > 0){
                    observer.next()
                    observer.complete()    
                } else {
                    observer.error(`Cannot find requested database '${databaseName}'`)
                }
            }
            var handleError = (ev: Event) => {
                this.logEvent('dropDatabase', ev)
                observer.error(deleteRequest.error)
            }
            var handleBlocked = (ev: Event) => {
                this.logEvent('dropDatabase', ev)
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

    openDatabase(databaseName: string, version: number, schema?: Array<ISchemaDeclaration>): Observable<any> {
        return Observable.create((observer: Subscriber<any>) => {
            var openRequest: IDBOpenDBRequest = this.indexedDB.open(databaseName, version);
            var handleSuccess = (ev: Event) => {
                this.logEvent('openDatabase', ev)
                this.registerDbListeners(observer, ev.target.result)
            }
            var handleError = (ev: Event) => {
                this.logEvent('openDatabase', ev)
                observer.error(openRequest.error)
            }
            var handleUpgrade = (ev: Event) => {
                this.logEvent('openDatabase', ev)
                this.upgradeDatabase(observer, ev.target.result, schema)
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

    /**
     * upgradeDatabase()
     * 
     * Internal function, called by openDatabase() when an 'upgradeNeeded' event is generated during the open request.
     */
    private upgradeDatabase(observer: Subscriber<any>, database: IDBDatabase, schema: Array<ISchemaDeclaration>) {
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
            
            if (schemaInstance.indexes){
                schemaInstance.indexes.forEach((indexDeclaration) => {
                    store.createIndex(indexDeclaration.name, indexDeclaration.key, indexDeclaration.optionalParameters);
                })    
            }
            
            
            store.transaction.oncomplete = (ev:Event) => {
                this.logEvent('updateDatabase', ev)
                this.registerDbListeners(observer, database)
            }
        })
    }
    
    /**
     * registerDbListeners()
     * 
     * ref: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#Version_changes_while_a_web_app_is_open_in_another_tab
     * ref: https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore
     */
    private registerDbListeners(observer: Subscriber<any>, database: IDBDatabase){
        
        // onerror and onabort are listed as part of the definitions...
        database.onerror = (ev:Event) => {
            this.logEvent("db", ev)
        };
        
        database.onabort = (ev:Event) => {
            this.logEvent("db", ev)
        };
        
        // onversionchange and onclose are listed object properties in Chrome
        database.onversionchange = (ev:Event) => {
            this.logEvent("db", ev)
            database.close();
            observer.error("IndexedDB schema version changed. Reload window is suggested")
        };
        
        database.onclose = (ev:Event) => {
            this.logEvent("db", ev)
        };

        observer.next(database)
        observer.complete()
    }
    
    /**
     * When observables don't do what I expect them to do...
     */
    hardDrop(databaseName: string) {
        let deleteRequest: IDBOpenDBRequest = this.indexedDB.deleteDatabase(databaseName)
        
        deleteRequest.onsuccess = (ev:Event) => {
            console.log("Success")
            console.log(ev);
        }
        deleteRequest.onblocked = (ev:Event) => {
            console.log("Blocked")
            console.log(ev);
        }
        deleteRequest.onerror = (ev:Event) => {
            console.log("Error")
            console.log(ev);
        }
        deleteRequest.onupgradeneeded = (ev:Event) => {
            console.log("Upgrade Needed")
            console.log(ev);
        }
    }
    
    /**
     * logEvent()
     * 
     * Push an IndexedDb event to an observer stream
     */
    logEvent(source:string, ev:Event){
        this.eventStream.next({
            source: source,
            event: ev.target.constructor.name,
            type: ev.type
        })
    }
    
    
    //////
    // Do these need to be Observable streams?  
    
    
    getTransaction(db: IDBDatabase, objectStoreNames: string[] | string, mode: ETransactionMode): IDBTransaction {
        var tnx: IDBTransaction = db.transaction(objectStoreNames, mode)
        tnx.onabort = (ev) => {
            this.logEvent('transaction', ev)
            // console.log(`Transaction aborted`)
        }

        tnx.onerror = (ev) => {
            this.logEvent('transaction', ev)
            // console.log(`Transaction error`)
        }

        tnx.oncomplete = (ev) => {
            this.logEvent('transaction', ev)
            // console.log(`Transaction complete`)
        }

        return tnx
    }
    
    getObjectStore(tnx: IDBTransaction, objectStoreName: string): IDBObjectStore {
        var store = tnx.objectStore(objectStoreName)
        return store
    }
    
    //////
    
    /**
     * insert()
     * 
     */
    insert(db:IDBDatabase, storeName:string, record:any, key?:number):Observable<any>{
        return Observable.create( (observer:Subscriber<any>) => {
            let tnx: IDBTransaction = this.getTransaction(db, storeName, "readwrite")
            let store: IDBObjectStore = this.getObjectStore(tnx, storeName)
            let addRequest: IDBRequest = store.add(record, key);
            
            var onSuccess = (ev:Event) => {
                this.logEvent('insert', ev)
                observer.next()
                observer.complete()
            }
            
            var onError = (ev:Event) => {
                this.logEvent('insert', ev)
                observer.error(ev)
            }
            
            addRequest.addEventListener(IDB_EVENT_SUCCESS, onSuccess)
            addRequest.addEventListener(IDB_EVENT_ERROR, onError)
            
            return () => {
                addRequest.removeEventListener(IDB_EVENT_SUCCESS, onSuccess)
                addRequest.removeEventListener(IDB_EVENT_ERROR, onError)
            }
        })
    }
    
    /**
     * batchInsert()
     * 
     */
    insertBatch(db:IDBDatabase, storeName:string, recordList:Array<any>, keyList?:Array<number>){
        return Observable.create( (observer:Subscriber<any>) => {
            let tnx: IDBTransaction = this.getTransaction(db, storeName, "readwrite")
            let store: IDBObjectStore = this.getObjectStore(tnx, storeName)
            
            let i = 0
            
            // ToDo - Fix this; recurrive function; preference to using iterator
            // ToDo - uses 'onsuccess' bindings instead of addEventListener
            const insertRecord = () => {
                if ( i < recordList.length) {
                    store.add(recordList[i]).onsuccess = (ev:Event) => {
                        this.logEvent("insertBatch", ev)
                        observer.next(i)
                        insertRecord()
                    } ;
                    store.add(recordList[i]).onerror = (ev:Event) => {
                        this.logEvent("insertBatch", ev)
                        observer.error(ev)
                    } ;                    
                    ++i
                } else {
                    observer.complete()
                }
            }
            insertRecord(); 
        })
    }
    
    /**
     * list()
     * 
     */
    list(db:IDBDatabase, storeName:string){
        return Observable.create( (observer:Subscriber<any>) => {
            let tnx: IDBTransaction = this.getTransaction(db, storeName, "readonly")
            let store: IDBObjectStore = this.getObjectStore(tnx, storeName)

            let cursor: IDBRequest = store.openCursor()

            var onSuccess = (ev:Event) => {
                this.logEvent('listCursor', ev)
                let iterator: IDBCursorWithValue = ev.target.result;
                if (iterator) {
                    observer.next(iterator.value);
                    iterator.continue();
                } else {
                    observer.complete()
                }
            }
            
            var onError = (ev:Event) => {
                this.logEvent('listCursor', ev)
                observer.error(ev)
            }
            
            cursor.addEventListener(IDB_EVENT_SUCCESS, onSuccess)
            cursor.addEventListener(IDB_EVENT_ERROR, onError)
            
            return () => {
                cursor.removeEventListener(IDB_EVENT_SUCCESS, onSuccess)
                cursor.removeEventListener(IDB_EVENT_ERROR, onError)
            }
                
        })
        
    }
    

}