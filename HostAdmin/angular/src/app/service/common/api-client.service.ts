import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { TenantHelper } from '@shared/helpers/TenantHelper';

const BASE_URL = TenantHelper.getEnvironmentBasedValue("apiServerBaseUrl");
const PLATFORM_URL = TenantHelper.getEnvironmentBasedValue("apiPlatformUrl");

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  private responseCache = new Map();
  private options = { headers: new HttpHeaders().set('Content-Type', 'application/json') };

  constructor(private httpClient: HttpClient) { }

  public get(path: string, params: HttpParams = new HttpParams(), cacheEnabled: boolean = false, isHardReload: boolean = false): Observable<any> {
    if (cacheEnabled)
      return this.getResponseFromCache(path, params, isHardReload);
    else
      return this.httpClient.get(BASE_URL + path, { params }).pipe(catchError(this.formatErrors), shareReplay());
  }

  public getCsvFile(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    return this.httpClient.get(BASE_URL + path, { params, responseType: 'text' }).pipe(catchError(this.formatErrors));
  }

  public getBlobFile(path: string, params: HttpParams = new HttpParams()): Observable<Blob> {
    return this.httpClient.get(BASE_URL + path, { params, responseType: 'blob' }).pipe(catchError(this.formatErrors));
  }

  public patch(path: string, body: object = {}): Observable<any> {
    return this.httpClient
      .patch(BASE_URL + path, JSON.stringify(body), this.options)
      .pipe(catchError(this.formatErrors));
  }

  public put(path: string, body: object = {}): Observable<any> {
    return this.httpClient
      .put(BASE_URL + path, JSON.stringify(body), this.options)
      .pipe(catchError(this.formatErrors));
  }

  public post(path: string, body: object = {}): Observable<any> {
    return this.httpClient
      .post(BASE_URL + path, JSON.stringify(body), this.options)
      .pipe(catchError(this.formatErrors));
  }

  public delete(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    return this.httpClient.delete(BASE_URL + path, { params }).pipe(catchError(this.formatErrors));
  }

  public postFile(path: string, body: object = {}): Observable<any> {
    return this.httpClient.post(BASE_URL + path, body).pipe(catchError(this.formatErrors));
  }

  public putFile(path: string, body: object = {}): Observable<any> {
    return this.httpClient.put(BASE_URL + path, body).pipe(catchError(this.formatErrors));
  }

  public platformPost(path: string, body: object = {}): Observable<any> {
    return this.httpClient.post(PLATFORM_URL + path, body).pipe(catchError(this.formatErrors));
  }

  public platformGet(path: string, body: object = {}): Observable<any> {
    return this.httpClient.get(PLATFORM_URL + path, body).pipe(catchError(this.formatErrors));
  }

  // Client side caching of HTTP requests
  public getResponseFromCache(Url: string, params: HttpParams = new HttpParams(), isHardReload: boolean): Observable<any> {
    const request = BASE_URL + Url + (params ? `?${params}` : '');
    let cachedResponse = this.responseCache.get(request);
    if (cachedResponse) {
      // on hardreload, delete cached response and reload it
      if (isHardReload) {
        this.responseCache.delete(request);
        return this.putResponseInCache(Url, params);
      }
      else {
        return of(cachedResponse);
      }
    }
    else {
      return this.putResponseInCache(Url, params);
    }
  }

  public putResponseInCache(url: string, params: HttpParams = new HttpParams()): Observable<any> {
    const request = BASE_URL + url + (params && params['map'] ? `?${params}` : '');
    const response = this.get(url, params);
    response.subscribe(res => this.responseCache.set(request, res));
    return response;
  }

  public reloadCache(url) {
    Array.from(this.responseCache.keys()).forEach(key => {
      if (key.includes(url)) {
        this.responseCache.delete(key);
        this.putResponseInCache(key.replace(BASE_URL, ""));
      }
    });
  }

  formatErrors(error: any): Observable<any> {
    return throwError(error);
  }
}
