import {BehaviorSubject, Subject} from "rxjs";
import {ICacheService, IndexDbStorage, IndexedDbCacheService, TimeSpan} from "@dorbit";


interface ChangeEvent<T> {
  store: T;
  changes: (keyof T & string)[]
}

export abstract class StoreService<T extends object> {
  private readonly _store: any = {};
  protected readonly cacheService: ICacheService;

  protected onChangeByKeys: { [key: string]: BehaviorSubject<T> } = {}
  onChange: BehaviorSubject<ChangeEvent<T>>;

  protected constructor(protected name: string) {
    this.cacheService = new IndexedDbCacheService(new IndexDbStorage({dbName: 'store'}))
    this.onChange = new BehaviorSubject<ChangeEvent<T>>({
      store: this._store,
      changes: []
    });
    this.onChange.subscribe(e => {
      e.changes.forEach(key => {
        this.onChangeByKeys[key]?.next(e.store);
      });
      if (e.changes.length == 0) {
        Object.values(this.onChangeByKeys).forEach(x => {
          x.next(e.store)
        });
      }
      this.onChangeByKeys['all']?.next(e.store);
    })
  }

  get store(): T {
    return this._store;
  }

  on(key: keyof T & string | 'all') {
    return this.onChangeByKeys[key] ??= new BehaviorSubject<any>(this.store);
  }

  async set(name: keyof T & string, value: any) {
    if(value === undefined || value === null) delete this._store[name]
    else this._store[name] = value;
    await this.save();
    this.onChange.next({store: this.store, changes: [name]});
  }

  async setBulk(changes: { key: keyof T & string, value: any }[]) {
    changes.forEach(x => this.store[x.key] = x.value);
    await this.save();
    this.onChange.next({store: this.store, changes: changes.map(x => x.key)});
  }

  async save() {
    await this.cacheService.set(this.name, this.store, TimeSpan.fromMonth(2));
  }

  async load() {
    Object.assign(this._store, (await this.cacheService.get<T>(this.name)) ?? this.store);
    this.onChange.next({store: this.store, changes: []});
  }

  async delete() {
    await this.cacheService.remove(this.name);
  }
}