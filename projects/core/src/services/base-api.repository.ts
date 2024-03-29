import {HttpClient, HttpContext, HttpEvent, HttpHandler, HttpHeaders, HttpParams, HttpRequest, HttpResponse} from "@angular/common/http";
import {Injectable, InjectionToken, Injector} from "@angular/core";
import {finalize, Observable, tap} from "rxjs";
import {LoadingService} from "./loading.service";

export const BASE_API_URL = new InjectionToken<string>('BASE_API_URL');

export interface HttpOptions {
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  context?: HttpContext;
  observe?: 'body';
  params?: HttpParams | {
    [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
  };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

@Injectable()
export abstract class BaseApiRepository {
  protected http: CustomHttpClient;
  protected baseUrl: string;

  protected constructor(protected injector: Injector, protected repository?: string) {
    this.baseUrl = injector.get(BASE_API_URL, '', {optional: true}) ?? '';
    const handler = new CustomHttpHandler(
      this.baseUrl,
      repository,
      injector.get(HttpHandler),
      injector.get(LoadingService),
    );
    this.http = new CustomHttpClient(handler);
  }

  setLoadingService(service: LoadingService) {
    this.http.customHandler.loadingService = service;
  }

  getUrl(url: string) {
    return `${this.baseUrl}${(this.baseUrl.endsWith('/') ? '' : '/')}${this.repository}/${url}`;
  }
}

class CustomHttpHandler extends HttpHandler {

  constructor(
    private baseUrl: string,
    private repository: string | undefined,
    private handler: HttpHandler,
    public loadingService: LoadingService,
  ) {
    super();
  }

  override handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {

    if (!req.url.startsWith('http')) {

      let url = req.url;
      if (url.startsWith('$')) {
        url = url.substring(1);
      } else {
        let baseUrl = this.baseUrl;
        if (url.startsWith('~')) {
          url = url.substring(1);
        } else if (this.repository) {
          baseUrl += (baseUrl.endsWith('/') ? '' : '/') + this.repository;
        }
        if (!baseUrl.endsWith('/')) baseUrl += '/';
        url = baseUrl + url;

        if (url.endsWith('/')) url = url.substring(0, url.length - 1);
      }

      req = req.clone({
        url: url
      });
    }

    this.loadingService.start();
    const timeout = setTimeout(() => {
      this.loadingService.end();
    }, 120000);

    return this.handler.handle(req).pipe(finalize(() => {
      clearTimeout(timeout);
      this.loadingService.end();
    }));
  }

}

class CustomHttpClient extends HttpClient {
  public customHandler: CustomHttpHandler;

  constructor(handler: CustomHttpHandler) {
    super(handler);
    this.customHandler = handler;
  }

}
