import { Injectable } from "@angular/core";
import { Http, Headers } from "@angular/http";
import 'rxjs/add/operator/toPromise';
import { IParseInsertableEntity, IParseUpdatableEntity } from "./parse_entity";

@Injectable()
export class ParseService<T> {

  private credentialHeaders: Headers;

  constructor(protected http: Http,
    private parseUrl: string,
    private parseId: string,
    private parseKey: string,
    private object: string) {
    this.credentialHeaders = new Headers({
      'X-Parse-Application-Id': this.parseId,
      'X-Parse-REST-API-Key': this.parseKey
    });
  }

  all(): Promise<T[]> {
    const url = `${this.parseUrl}/classes/${this.object}`;
    console.log(`ParseService.all.url: ${url}`);
    return this.http.get(url, { headers: this.credentialHeaders })
      .toPromise()
      .then(response => response.json().results as T[])
      .catch(this.handleError);
  }

  query(queryString: string): Promise<T[]> {
    const url = `${this.parseUrl}/classes/${this.object}?${encodeURI(queryString)}`;
    console.log(`ParseService.query.url: ${url}`);
    return this.http.get(url, { headers: this.credentialHeaders })
      .toPromise()
      .then(response => response.json().results as T[])
      .catch(this.handleError);
  }

  get(id: string): Promise<T> {
    const url = `${this.parseUrl}/classes/${this.object}/${id}`;
    console.log(`ParseService.get.url: ${url}`);
    return this.http.get(url, { headers: this.credentialHeaders })
      .toPromise()
      .then(response => response.json() as T)
      .catch(this.handleError);
  }

  insert(data: any): Promise<IParseInsertableEntity> {
    const url = `${this.parseUrl}/classes/${this.object}`;
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

      if (value instanceof Object) {
        var objectProperties = Object.getOwnPropertyNames(value);

        if (objectProperties.indexOf("objectId") >= 0) {
          var relation = this.makeRelation(prop, value.className, value.objectId);
          relations.push(relation);
          delete data[prop];
        }
      }
    });

    return relations;
  }

  update(id: string, data: any): Promise<IParseUpdatableEntity> {
    const url = `${this.parseUrl}/classes/${this.object}/${id}`;
    console.log(`ParseService.update.url: ${url}`);
    return this.http.put(url, data, { headers: this.credentialHeaders })
      .toPromise()
      .then(response => response.json() as IParseUpdatableEntity)
      .catch(this.handleError);
  }

  delete(id: string): Promise<T> {
    const url = `${this.parseUrl}/classes/${this.object}/${id}`;
    console.log(`ParseService.delete.url: ${url}`);
    return this.http.delete(url, { headers: this.credentialHeaders })
      .toPromise()
      .then(response => response.json() as T)
      .catch(this.handleError);
  }

  addRelation(objectId: string, relation: string) {
    const url = `${this.parseUrl}/classes/${this.object}/${objectId}`;
    console.log(`ParseService.addRelation.url: ${url}`);

    return this.http.put(url, JSON.parse(relation), { headers: this.credentialHeaders })
      .toPromise()
      .then(response => response.json() as IParseUpdatableEntity)
      .catch(this.handleError);
  }

  private makeRelation(propertyRelation: string, relationClass: string, objectIdRelationClass: string): string {
    return `
    {
       "${propertyRelation}": {
         "__op": "AddRelation",
         "objects": [
           {
             "__type": "Pointer",
             "className": "${relationClass}",
             "objectId": "${objectIdRelationClass}"
           }
         ]
       }
     }
    `;
  }

  private logRelationError(error: any): void {
    console.error('An error ocurred on ParseService.relations', error);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error ocurred on ParseService', error);
    return Promise.reject(error.message || error);
  }
}
