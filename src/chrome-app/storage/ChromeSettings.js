//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without modification,
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation and/or
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be
//  used to endorse or promote products derived from this software without specific
//  prior written permission.

define([],function(){

    Settings = {
        put : function(key, val, callback){
            var obj = {};
            obj[key] = JSON.stringify(val);
            chrome.storage.local.set(obj, callback);
        },
        
        // Note that compared to getMultiple(), here the callback function parameter gets a JSON.parse'd value (not the raw string from the key/value store)
        get : function(key, callback){
            chrome.storage.local.get(key, function(val){
                if (val[key]){
                    callback(JSON.parse(val[key]));
                }
                else{
                    callback(null);
                }
            });
        },
        
        // Note that compared to get(), here the callback function parameter does not get JSON.parse'd values (instead: raw string from the key/value store)
        getMultiple : function(keys, callback){
            chrome.storage.local.get(keys, function(val){
                callback(val);
            });
        }
    }
    return Settings;
})
