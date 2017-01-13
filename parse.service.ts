import { Injectable } from "@angular/core";
import { Http, Headers } from "@angular/http";
import 'rxjs/add/operator/toPromise';
import { IParseInsertableEntity, IParseUpdatableEntity, IParseEntity } from "./parse_entity";

@Injectable()
export class ParseService<T> {

  private credentialHeaders: Headers;

  constructor(protected http: Http,
    private parseUrl: string,
    private parseId: string,
    private parseKey: string,
    private objectType: string) {
    this.credentialHeaders = new Headers({
      'X-Parse-Application-Id': this.parseId,
      'X-Parse-REST-API-Key': this.parseKey
    });
  }

  all(): Promise<T[]> {
    const url = `${this.parseUrl}/classes/${this.objectType}`;
    console.log(`ParseService.all.url: ${url}`);

    return this.http.get(url, { headers: this.credentialHeaders })
      .toPromise()
      .then(response => response.json().results as T[])
      .catch(this.handleError);
  }

  query(queryString: string): Promise<T[]> {
    const url = `${this.parseUrl}/classes/${this.objectType}?${encodeURI(queryString)}`;
    console.log(`ParseService.query.url: ${url}`);

    return this.http.get(url, { headers: this.credentialHeaders })
      .toPromise()
      .then(response => response.json().results as T[])
      .catch(this.handleError);
  }

  get(id: string): Promise<T> {
    const url = `${this.parseUrl}/classes/${this.objectType}/${id}`;
    console.log(`ParseService.get.url: ${url}`);


    return this.http.get(url, { headers: this.credentialHeaders })
      .toPromise()
      .then(response => response.json() as T)
      .catch(this.handleError);
  }

  insert(data: any): Promise<IParseInsertableEntity> {
    const url = `${this.parseUrl}/classes/${this.objectType}`;
    console.log(`ParseService.insert.url: ${url}`);

    var relations = this.makeRelationsOfObject(data);

    return this.http.post(url, data, { headers: this.credentialHeaders })
      .toPromise()
      .then(response => {
        var inserted = response.json() as IParseInsertableEntity;

        relations.forEach(relation => {
          this.addRelation(inserted.objectId, relation)
            .catch(this.logRelationError);
        });

        return inserted;
      })
      .catch(this.handleError);
  }

  private makeRelationsOfObject(data: Object) {
    var relations = [];
    var properties = Object.getOwnPropertyNames(data);

    properties.forEach(prop => {
      var value = data[prop];

      if (this.isIRelationableEntity(value)) {
        var relation = this.makeRelation(prop, value);
        relations.push(relation);
        delete data[prop];
      }
    });

    return relations;
  }

  update(id: string, data: any): Promise<IParseUpdatableEntity> {
    const url = `${this.parseUrl}/classes/${this.objectType}/${id}`;
    console.log(`ParseService.update.url: ${url}`);

    return this.http.put(url, data, { headers: this.credentialHeaders })
      .toPromise()
      .then(response => response.json() as IParseUpdatableEntity)
      .catch(this.handleError);
  }

  delete(id: string): Promise<T> {
    const url = `${this.parseUrl}/classes/${this.objectType}/${id}`;
    console.log(`ParseService.delete.url: ${url}`);

    return this.http.delete(url, { headers: this.credentialHeaders })
      .toPromise()
      .then(response => response.json() as T)
      .catch(this.handleError);
  }

  addRelation(objectId: string, relation: string) {
    const url = `${this.parseUrl}/classes/${this.objectType}/${objectId}`;
    console.log(`ParseService.addRelation.url: ${url}`);

    return this.http.put(url, JSON.parse(relation), { headers: this.credentialHeaders })
      .toPromise()
      .then(response => response.json() as IParseUpdatableEntity)
      .catch(this.handleError);
  }

  private isIRelationableEntity(object: any): boolean {
    return object instanceof Object && object.objectId;
  }

  private makeRelation(keyRelation: string, valueRelation: IParseEntity): Object {
    var relation = `{
       "${keyRelation}": {
         "__op": "AddRelation",
         "objects": [
           {
             "__type": "Pointer",
             "className": "${valueRelation.constructor.name}",
             "objectId": "${valueRelation.objectId}"
           }
         ]
       }
     }`;

    return JSON.parse(relation);
  }

  private logRelationError(error: any): void {
    console.error('An error ocurred on ParseService.relations', error);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error ocurred on ParseService', error);
    return Promise.reject(error.message || error);
  }
}
