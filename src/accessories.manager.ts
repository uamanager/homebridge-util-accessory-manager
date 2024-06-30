import { API, Logger, PlatformAccessory } from 'homebridge';
import { AccessoriesCache } from './accessories.cache';
import { BaseAccessory, IBaseAccessoryCtor } from './accessory.js';
import { IBaseAccessoryContext } from './accessory.context.js';

export class AccessoriesManager<AT extends BaseAccessory<AC>, AC extends IBaseAccessoryContext> {
  private _accessories: Map<string, AT> = new Map();
  private $_cacheManager: AccessoriesCache<AC>;

  constructor(
    protected readonly _pluginName: string,
    protected readonly _platformName: string,
    protected readonly $_api: API,
    protected readonly $_logger?: Logger,
  ) {
    this.$_cacheManager = new AccessoriesCache($_logger);
    this.$_logger && this.$_logger.debug('Finished initializing accessories manager');
  }

  cache(uuid: string, accessory: PlatformAccessory<AC>) {
    this.$_cacheManager.add(uuid, accessory);
  }

  clean() {
    this.$_cacheManager.forEach((value, key) => {
      this.$_cacheManager.remove(key);
      if (value) {
        this.unregister(key, value);
      }
    });
    this.$_logger && this.$_logger.debug('Finished cleaning accessories cache');
  }

  get<T extends AT = AT>(uuid: string): T | undefined {
    return this._accessories.get(uuid) as T | undefined;
  }

  register(
    uuid: string,
    ctor: IBaseAccessoryCtor<AT>,
    context: AC,
  ) {
    const _cachedAccessory = this.$_cacheManager.remove(uuid);

    if (_cachedAccessory) {
      _cachedAccessory.context = { ...context };

      this._accessories.set(uuid, new ctor(
        this.$_api,
        _cachedAccessory,
        this.$_logger,
      ));


      this.$_logger
      && this.$_logger.debug('Updating accessory:', uuid, _cachedAccessory.displayName);

      return this.$_api.updatePlatformAccessories([_cachedAccessory]);
    } else {
      const _accessory = new this.$_api.platformAccessory(context.name, uuid);

      _accessory.context = { ...context };

      this._accessories.set(uuid, new ctor(
        this.$_api,
        _accessory as PlatformAccessory<AC>,
        this.$_logger,
      ));

      this.$_logger
      && this.$_logger.debug('Registering accessory:', uuid, _accessory.displayName);

      this.$_api.registerPlatformAccessories(
        this._pluginName,
        this._platformName,
        [_accessory],
      );
    }
  }

  unregister(uuid: string, accessory: PlatformAccessory<AC>) {
    this.$_api.unregisterPlatformAccessories(
      this._pluginName,
      this._platformName,
      [accessory],
    );

    if (this._accessories.has(uuid)) {
      this._accessories.delete(uuid);
    }

    this.$_logger
    && this.$_logger.debug('Unregistering accessory:', uuid, accessory.displayName);
  }
}
