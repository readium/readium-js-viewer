This is a pre-alpha state full-text-search feature for  [readium-js-viewer](https://github.com/readium/readium-js-viewer/), the "online cloud reader" for online e-books https://readium.firebaseapp.com.

Note:  
* Full-Text-Search-Feature works only in Webkit based browsers without limits
* The current feature only supports the cloud-reader version

## Running demo
Not present at the moment 

## Usage

1. install [epub-full-text-search](https://github.com/larsvoigt/epub-full-text-search)
2. Checkout this branch https://github.com/larsvoigt/readium-js-viewer/tree/feature/new_full_text_search
3. Prerequisites are same like the [orginal readium repro](https://github.com/readium/readium-js-viewer/tree/develop#development)
4.  ```npm run build```
5.  ``` npm run dist:cloudReader ```

## Troubleshooting 

Maybe configurate the correct [host](https://github.com/larsvoigt/readium-js-viewer/blob/feature/new_full_text_search/src/js/FullTextSearch.js#L32) for [epub-full-text-search](https://github.com/larsvoigt/epub-full-text-search) and run  ``` npm run dist:cloudReader ``` again.
 
