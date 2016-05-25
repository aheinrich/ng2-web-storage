# ng2-web-storage

Simple project for implementing various Web storage technologies (lcoalstorage, indexeddb, etc...)

Influenced by:
- ngrx-db

Uses RxJs Observables

### Please note: *This is not ready for public consumption; Work in progress*

## Demo Installation

`npm install`

## Start demo

`npm run start`

## Usage - IndexedDb

A service can use this library  (?!) to abstract away the implementation details of using IndexedDB. Instead, a local Angular2 
service can go about its normal business, and use IndexedDb to persist data beyond a user's session.

Note - This is not intended to be a search/query service; Just basic storage for now...  

Any service that wants to make use of the service should implement the `IIndexedDbService` interface:

```
import { IIndexedDbService } from '../storage/indexeddb.service';
...

@Injectable()
export class MyLocalStorage implements IIndexedDbService{
    
    _db: IDBDatabase;
    
    ...
    
    finished(){
        this._db.close()
    }

}

```

A service that implements IndexedDbService needs 3 attributes:
- `dbName` - Name of the IndexedDb
- `dbVersion` - Version number of the database
- `schema` - A collection of stores to be defined within the IndexedDb

## Usage - LocalStorage

### Coming soon ... 