import { Injectable } from "@angular/core";
import { Http, Headers } from "@angular/http";
import 'rxjs/add/operator/toPromise';
import { IParseInsertableEntity, IParseUpdatableEntity, IParseEntity, IParseRelationableEntity, IParseDeletableEntity } from "./parse_entity";

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

  get(id: string, includeProperties?: string): Promise<T> {
    var url = `${this.parseUrl}/classes/${this.objectType}/${id}`;

    if (includeProperties) {
      url = `${url}?include=${includeProperties}`;
    }

    console.log(`ParseService.get.url: ${url}`);

    return this.http.get(url, { headers: this.credentialHeaders })
      .toPromise()
      .then(response => response.json() as T)
      .catch(this.handleError);
  }

  insert(data: any): Promise<IParseInsertableEntity> {
    const url = `${this.parseUrl}/classes/${this.objectType}`;
    console.log(`ParseService.insert.url: ${url}`);

    data = this.compileRelationsOfObject(data);

    return this.http.post(url, data, { headers: this.credentialHeaders })
      .toPromise()
      .then(response => response.json() as IParseInsertableEntity)
      .catch(this.handleError);
  }

  update(id: string, data: any): Promise<IParseUpdatableEntity> {
    const url = `${this.parseUrl}/classes/${this.objectType}/${id}`;
    console.log(`ParseService.update.url: ${url}`);

    data = this.compileRelationsOfObject(data);

    return this.http.put(url, data, { headers: this.credentialHeaders })
      .toPromise()
      .then(response => response.json() as IParseUpdatableEntity)
      .catch(this.handleError);
  }

  delete(id: string): Promise<IParseDeletableEntity> {
    const url = `${this.parseUrl}/classes/${this.objectType}/${id}`;
    console.log(`ParseService.delete.url: ${url}`);

    return this.http.delete(url, { headers: this.credentialHeaders })
      .toPromise()
      .then(response => response.json() as IParseDeletableEntity)
      .catch(this.handleError);
  }

  private isIRelationableEntity(object: any): boolean {
    return object instanceof Object && object.objectId && object.relationClassName;
  }

  private compileRelationsOfObject(data: Object): Object {
    var properties = Object.getOwnPropertyNames(data);

    properties.forEach(prop => {
      var value = data[prop];

      if (this.isIRelationableEntity(value)) {
        var relation = this.makeRelation(prop, value);
        data[prop] = relation;
      }
    });

    return data;
  }

  private makeRelation(keyRelation: string, valueRelation: IParseRelationableEntity): Object {
    var relation = `{
                       "${keyRelation}": {
                           "__type": "Pointer",
                           "className": "${valueRelation.relationClassName}",
                           "objectId": "${valueRelation.objectId}"
                       }
                     }`;

    return JSON.parse(relation);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error ocurred on ParseService', error);
    return Promise.reject(error.message || error);
  }
}
