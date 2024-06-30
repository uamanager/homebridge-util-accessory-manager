import { Logger, PlatformAccessory } from 'homebridge';
import { IBaseAccessoryContext } from './accessory.context';

export class AccessoriesCache<AC extends IBaseAccessoryContext> {
  private _cache: Map<string, PlatformAccessory<AC>> = new Map();

  constructor(private readonly $_logger?: Logger) {
    this.$_logger && this.$_logger.debug('Finished initializing accessories cache');
  }

  add(uuid: string, accessory: PlatformAccessory<AC>) {
    this.$_logger && this.$_logger.debug(
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
  ) => void, thisArg?: unknown) {
    this._cache.forEach(callbackFn, thisArg);
  }

  remove(uuid: string): PlatformAccessory<AC> | undefined {
    this.$_logger && this.$_logger.debug(
      'Trying to remove existing accessory from cache manager:',
      uuid,
    );
    const _accessory = this._cache.get(uuid);

    if (_accessory) {
      this._cache.delete(uuid);
      this.$_logger && this.$_logger.debug(
        'Removing existing accessory from cache manager:',
        uuid,
        _accessory.displayName,
      );
    }

    return _accessory;
  }
}
