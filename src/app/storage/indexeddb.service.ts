import { Injectable } from '@angular/core';

interface Datastore {
    insert(): void;
    remove(): void;
    update(): void;
    query(): void;
}

type ETransactionMode = "readwrite" | "readonly" | "versionchange"


export interface IDBSchemaDeclaration {
    name: string,
    keyPath?: string
    keyGenerator?: any
}


@Injectable()
export class IndexedDbService {

    databaseHandle: IDBDatabase;

    constructor() { }
    
    setupHandlers(){
        console.log("Setting up database object handlers...")
        this.databaseHandle.onabort = (event) => this._handleEvent(event)
        this.databaseHandle.onerror = (event) => this._handleEvent(event)
        this.databaseHandle.onclose = (event) => this._handleEvent(event)
        this.databaseHandle.onversionchange = (event) => this._handleEvent(event)
    }

    createDatabase(databaseName: string, version: number, schema: IDBSchemaDeclaration[]) {
        console.log(`Creating schema...`)
        return Promise.all(schema.map((schemaInstance: IDBSchemaDeclaration) => {
            return this.createSchema(this.databaseHandle, schemaInstance)
        }))
    }

    createSchema(db: IDBDatabase, schemaInstance: IDBSchemaDeclaration) {
        return new Promise((resolve, reject) => {
            console.log(`Creating Objectstore '${schemaInstance.name}'...`)
            let optionParams: IDBObjectStoreParameters = {}

            if (schemaInstance.keyPath) {
                optionParams['keyPath'] = schemaInstance.keyPath
            }

            if (schemaInstance.keyGenerator) {
                optionParams['keyGenerator'] = schemaInstance.keyGenerator
            }
            let store: IDBObjectStore = db.createObjectStore(schemaInstance.name, optionParams);

            store.transaction.oncomplete = (event) => {
                console.log(`Transaction completed, all schemes created`)
                resolve()
            }

            store.transaction.onerror = (event) => {
                reject(store.transaction.error)
            }
        })
    }

    dropDatabase(databaseName: string) {
        return new Promise((resolve, reject) => {
            let deleteRequest: IDBOpenDBRequest = window.indexedDB.deleteDatabase(databaseName)

            deleteRequest.onerror = (event) => {
                reject(event)
            }

            deleteRequest.onsuccess = (event) => {
                resolve(true)
            }

            deleteRequest.onblocked = (event) => {
                console.log(`OpenDbRequest blocked`)
                reject()
            }

        })

    }

    open(databaseName: string, version: number) {
        let openRequest: IDBOpenDBRequest = window.indexedDB.open(databaseName, version);

        openRequest.onerror = (event) => {
            console.log(`OpenDbRequest error`)
        }

        openRequest.onsuccess = (event) => {
            console.log(`OpenDbRequest success`)
            this.databaseHandle = event.target.result
            this.setupHandlers()
        }

        openRequest.onupgradeneeded = (event) => {
            console.log(`OpenDbRequest upgrade needed`)
        }

        openRequest.onblocked = (event) => {
            console.log(`OpenDbRequest blocked`)
        }
    }
    
    close() {
        this.databaseHandle.close()
    }
    
    _handleEvent(event:any){
        console.log(`Handling event....`)
        console.log(event)
    }
    
    /**
     * 
     */
    getDatabaseInstance(databaseName: string, version: number) {
        return new Promise((resolve, reject) => {
            let openRequest: IDBOpenDBRequest = window.indexedDB.open(databaseName, version);

            openRequest.onerror = (event) => {
                console.log(`OpenDbRequest error`)
                console.log(openRequest.error)
                reject(openRequest.error)
            }

            openRequest.onsuccess = (event) => {
                console.log(`OpenDbRequest success`)

                // let db:IDBDatabase = event.target.result
                // db.addEventListener("upgradeneeded", () => console.log(`Database Event : UpgradeNeeded`))
                // db.addEventListener("complete", () => console.log(`Database Event : Complete`))
                // db.addEventListener("abort", () => console.log(`Database Event : Abort`))
                // db.addEventListener("success", () => console.log(`Database Event : Success`))
                // db.addEventListener("error", () => console.log(`Database Event : Error`))
                // db.addEventListener("blocked", () => console.log(`Database Event : Blocked`))
                // db.addEventListener("versionchange", () => console.log(`Database Event : Version Change`))
                // db.addEventListener("close", () => console.log(`Database Event : Close`))

                resolve(event.target.result);
            }

            openRequest.onupgradeneeded = (event) => {
                console.log(`OpenDbRequest upgrade needed`)
                resolve(event.target.result);
            }

            openRequest.onblocked = (event) => {
                console.log(`OpenDbRequest blocked`)
                reject()
            }
        })
    }

    /**
     * Transactions will remain active as long as there are pending Requests
     */
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

    /**
     * 
     */
    getObjectStore(tnx: IDBTransaction, objectStoreName: string): IDBObjectStore {
        var store = tnx.objectStore(objectStoreName)
        console.log(`ObjectStore Available`)

        return store
    }

    /**
     * 
     */
    insert(db: IDBDatabase, storeName: string, record: any) {
        let tnx: IDBTransaction = this.getTransaction(db, storeName, "readwrite")
        let store: IDBObjectStore = this.getObjectStore(tnx, storeName)
        let addRequest: IDBRequest = store.add(record);

        addRequest.onsuccess = (event: any) => {
            console.log("AddRequest success")
        }

        addRequest.onerror = (event: any) => {
            console.log("AddRequest error")
        }
    }

    /**
     * 
     */
    remove(db: IDBDatabase, storeName: string, key: string) {
        let tnx: IDBTransaction = this.getTransaction(db, storeName, "readwrite")
        let store: IDBObjectStore = this.getObjectStore(tnx, storeName)
        let deleteRequest: IDBRequest = store.delete(key);

        deleteRequest.onsuccess = (event: any) => {
            console.log("DeleteRequest success")
        }

        deleteRequest.onerror = (event: any) => {
            console.log("DeleteRequest error")
        }

    }

    /**
     * 
     */
    retrieve(db: IDBDatabase, storeName: string, key: string) {
        let tnx: IDBTransaction = this.getTransaction(db, storeName, "readonly")
        let store: IDBObjectStore = this.getObjectStore(tnx, storeName)
        let getRequest: IDBRequest = store.get(key);

        getRequest.onsuccess = (event: any) => {
            console.log("GetRequest success")
        }

        getRequest.onerror = (event: any) => {
            console.log("GetRequest error")
        }
    }

    /**
     * 
     */
    update(db: IDBDatabase, storeName: string, key: string, updateFunction: (data: any) => void) {
        let tnx: IDBTransaction = this.getTransaction(db, storeName, "readwrite")
        let store: IDBObjectStore = this.getObjectStore(tnx, storeName)
        let getRequest: IDBRequest = store.get(key);

        getRequest.onsuccess = (event: any) => {
            console.log("GetRequest success")
            var oldRecord = getRequest.result;
            var newRecord = updateFunction(oldRecord)
            var putRequest = store.put(newRecord);

            putRequest.onsuccess = (event: any) => {
                console.log("PutRequest success")
            }

            putRequest.onerror = (event: any) => {
                console.log("PutRequest error")
            }

        }

        getRequest.onerror = (event: any) => {
            console.log("GetRequest error")
        }
    }

    /**
     * 
     */

    listAll(db: IDBDatabase, storeName: string) {
        return new Promise((resolve, reject) => {
            let tnx: IDBTransaction = this.getTransaction(db, storeName, "readwrite")
            let store: IDBObjectStore = this.getObjectStore(tnx, storeName)

            let cursor: IDBRequest = store.openCursor()
            let results: Array<any> = []

            cursor.onsuccess = (event: any) => {

                let iterator: IDBCursorWithValue = event.target.result;
                if (iterator) {
                    results.push(iterator.value);
                    iterator.continue();
                } else {
                    resolve(results)
                }
            }

            cursor.onerror = (event: any) => {
                reject(event)
            }
        })
    }
}