import {Logger, PlatformAccessory} from 'homebridge';
import {IAccessoryContext} from './accessory.context';

export class AccessoriesCache<AC extends IAccessoryContext> {
  private _cache: Map<string, PlatformAccessory<AC>> = new Map();

  constructor(private readonly logger: Logger) {
    this.logger.debug('Finished initializing accessories cache');
  }

  add(uuid: string, accessory: PlatformAccessory<AC>) {
    this.logger.debug(
      'Adding existing accessory to cache manager:',
      uuid,
      accessory.displayName,
    );
    this._cache.set(uuid, accessory);
  }

  forEach(callbackFn: (
    value: PlatformAccessory<AC>,
    key: string,
    map: Map<string, PlatformAccessory<AC>>,
  ) => void, thisArg?) {
    this._cache.forEach(callbackFn, thisArg);
  }

  remove(uuid: string): PlatformAccessory<AC> | undefined {
    this.logger.debug(
      'Trying to remove existing accessory from cache manager:',
      uuid,
    );
    const _accessory = this._cache.get(uuid);

    if (_accessory) {
      this._cache.delete(uuid);
      this.logger.debug(
        'Removing existing accessory from cache manager:',
        uuid,
        _accessory.displayName,
      );
    }

    return _accessory;
  }
}
