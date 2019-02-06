export default class Registry<T> {
  private _map: Map<string, T> = new Map();

  register(key: string, object: T): T {
    this._map.set(key, object);

    return object;
  }

  get(key: string): T | undefined {
    return this._map.get(key);
  }
}
