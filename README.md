# angular2-parse-module

Primitive Angular 2 module to access Parse.com backend.
Parse REST docs: http://parseplatform.github.io/docs/rest/guide

## Install NPM

```sh
npm install git+https://github.com/peterantonyrausch/angular2-parse-module --save
```

### Example service

```ts
import {Injectable} from "@angular/core";
import {Hero} from "../../viewmodels/hero";
import {Http} from "@angular/http";
import {environment} from "../../../environments/environment";
import {ParseService} from "angular2-parse-module";

@Injectable()
export class HeroService extends ParseService<Hero> {

  constructor(protected http: Http) {
    super(http,
      environment.parseUrl,
      environment.parseId,
      environment.parseKey,
      'Hero');
  }

  getByNumRange(start: number, end: number): Promise<Hero[]> {
    return this.query(`where={"num":{"$gt": ${start}, "$lt": ${end}}}`);
  }
}
```

### Example model class

```ts
import {
  IParseInsertableEntity,
  IParseEntity,
  IParseUpdatableEntity
} from "angular2-parse-module";

export class Hero implements IParseEntity, IParseInsertableEntity, IParseUpdatableEntity {
  objectId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
}
```

### Example service usage

```ts
this.heroService
    .getByNumRange(1, 5)
    .then(heroes => this.heroes = heroes);
    
this.heroService.all();
```

**************

## Install Parse `(parse.com)` (Windows 10)
* [1] Download and install (NNF: next, next, finish) mongodb:
https://www.mongodb.com/download-center#production;
* * [1.1] Create folder `C:/data/db` if not exists;
* [2] Download and install python:
https://www.python.org/downloads/release/python-2711/
* [3] Install parse-server: 
```sh 
npm install -g parse-server 
```
* [4] *(optional)* Install parse-dashboard: 
```sh 
npm install -g parse-dasboard 
```
* [5] Clone (or download the zip) parse-server-example:
https://github.com/ParsePlatform/parse-server-example
* [5.1] Install parse-server dependencies
```sh 
cd "C:\path\to\parse-server-example"
npm install
```
* [5.2] Configure `appId` and `masterKey` on parse-server-example/index.js:
```js 
[...]
appId: process.env.APP_ID || ‘myAppId’ // replace 'myAppId'
masterKey: process.env.MASTER_KEY || ‘myMasterKey’ // replace: 'myMasterKey'
[...]
```

### Run Parse (Windows 10)
* [1] Run mongodb
```sh
"c:\Program Files\MongoDB\Server\3.4\bin\mongod.exe"
```
* [2] Run parse-server (default: `http://localhost:1337/parse`, configured in `index.js`)
```sh
cd "C:\path\to\parse-server-example"
npm start
```
* [3] *(optional)* Run parse-dashboard (default: `http://localhost:4040`)
```sh
parse-dashboard --appId myAppId --masterKey myMasterKey --serverURL http://localhost:1337/parse 
```


