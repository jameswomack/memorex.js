# memorex.js

## Record your Node.js server's responses and play them back later

### Who is memorex.js useful for?
memorex.js is for anyone who can benefit from faster, semi-realistic but not necessarily 100% up-to-date and accurate server responses. Typical uses involve testing or developing in any one of the following scenarios
* modules that transform server responses
* view components that display data from server responses
* styling

You never want to use memorex.js in production or when you're testing the code that creates your responses (database adapters for example).

### Technical overview
memorex.js is simple cache middleware that uses the file system as the store. This will work with any Node.js server that internally leverages `http.Server` (Express & Restify included).

### Installation
    npm i memorex -SE
    
### Use

```
import Memorex from 'memorex'
import API     from './lib/api'


const memorex = Memorex({
  // [optional] the type of compression to save the responses with
  compression : Memorex.CompressionTypes.deflateRaw,
  
  // [required] enables your to toggle caching with a flag
  enabled     : process.env.NODE_ENV !== 'production',
  
  // [optional] allows you to control the name of the subfolder this reponses are stored in. Defaults to `require('paqman').packageJSON.name`
  name        : 'API'
  // See index.js for more options
}).middleware


const memrx = memorex(/* see index.js for options */)

server.get('/api/tortas', memrx, API.getTorta)

```
    

### Thanks
This project takes ideas from the *apicache* and *sync-disk-cache* packages. 
Parts of the code are copyright 2013 Kevin Whitley & 2015 Stefan Penner. See the licenses folder for more.
