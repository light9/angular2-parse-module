# angular2-parse-module

### Example service


```ts
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

### Example class
import {
  IParseInsertableEntity,
  IParseEntity,
  IParseUpdatableEntity
} from "../components/parse/parse-entity";

export class Hero implements IParseEntity, IParseInsertableEntity, IParseUpdatableEntity {
  objectId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
}
