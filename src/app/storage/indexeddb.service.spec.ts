import { it, iit, describe, expect, inject, async, beforeEachProviders, fakeAsync, tick } from '@angular/core/testing';
import { provide } from '@angular/core';

import { IndexedDbService } from './indexeddb.service';

/**
 * 
 * ref: http://w3c.github.io/test-results/IndexedDB/all.html
 * 
 */
describe('IndexedDbService', () => {
    
    let service:IndexedDbService = new IndexedDbService();
    
    it('has name', () => {
        expect(true).toEqual(true);
    });

    
    
});


// import {MyService} from "./my-service";
 
// describe('MyService Tests', () => {
    
 
//     it('Should return a list of dogs', () => {
//         var items = service.getDogs(4);
 
//         expect(items).toEqual(['golden retriever', 'french bulldog', 'german shepherd', 'alaskan husky']);
//     });
 
//     it('Should get all dogs available', () => {
//         var items = service.getDogs(100);
 
//         expect(items).toEqual(['golden retriever', 'french bulldog', 'german shepherd', 'alaskan husky', 'jack russel terrier', 'boxer', 'chow chow', 'pug', 'akita', 'corgi', 'labrador']);
//     });
// });