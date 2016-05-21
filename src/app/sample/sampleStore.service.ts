import { Injectable } from '@angular/core';

import { IndexedDbService } from '../storage/indexeddb.service'

@Injectable()
export class SampleStoreService {

    constructor(private storage:IndexedDbService) {}
    
    open(){
        this.storage.open("SampleDb", 1)
    }
    
    close(){
        this.storage.close()
    }
    
    create(){
        this.storage.createDatabase("SampleDb", 1, [
            {"name":"basicStore"},
            {"name":"storeWithKey", "keyPath": "id"},
            {"name":"storeWithGenerator", "keyGenerator": { autoIncrement : true }},
            {"name":"advStoreWithKeyAndGenerator", "keyPath": "id", "keyGenerator": { autoIncrement : true }},
        ])
    }
    
    destory(){
        this.storage.dropDatabase("SampleDb").then(res => {
            console.log("Database dropped")
        }, err => {
            console.log("Cannot drop database")
        })
    }
    
    insert(){
        
    }

}