import { Component, OnInit } from '@angular/core';
import { Routes, Router, ROUTER_DIRECTIVES } from '@angular/router';
import { SampleStoreService } from './sample/sampleStore.service'
import { IndexedDbService } from './storage/indexeddb.service'

@Component({
    moduleId: module.id,
    selector: 'app',
    styleUrls: ['app.component.css'],
    templateUrl: 'app.component.html',
    directives: [ROUTER_DIRECTIVES],
    providers: [ IndexedDbService, SampleStoreService ]
})
@Routes([
])

export class AppComponent implements OnInit {
    constructor(private router: Router, private storage: SampleStoreService) { }

    ngOnInit() {}
    
    doCreate(){
        this.storage.create()
    }
    
    doDestroy(){
        this.storage.destory()
    }
    
    doOpen(){
        this.storage.open()
    }
    
    doClose(){
        this.storage.close()
    }

}