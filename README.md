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