import {API, DynamicPlatformPlugin, Logger, PlatformAccessory} from 'homebridge';
import {AccessoriesCache} from './accessories.cache';
import {AccessoryAbstract, IAccessoryCtor} from './accessory.abstract';
import {IAccessoryContext} from './accessory.context';

export class AccessoriesManager<AT extends AccessoryAbstract<AC>, AC extends IAccessoryContext> {
  private _accessories: Map<string, AT> = new Map();
  private _cacheManager: AccessoriesCache<AC>;

  constructor(
    protected readonly logger: Logger,
    protected readonly pluginName: string,
    protected readonly platformName: string,
    protected readonly api: API,
    protected readonly platform: DynamicPlatformPlugin,
  ) {
    this._cacheManager = new AccessoriesCache(logger);
    this.logger.debug('Finished initializing accessories manager');
  }

  cache(uuid: string, accessory: PlatformAccessory<AC>) {
    this._cacheManager.add(uuid, accessory);
  }

  clean() {
    this._cacheManager.forEach((value, key) => {
      this._cacheManager.remove(key);
      if (value) {
        this.unregister(key, value);
      }
    });
    this.logger.debug('Finished cleaning accessories cache');
  }

  get<T extends AT = AT>(uuid: string): T | undefined {
    return this._accessories.get(uuid) as T | undefined;
  }

  register(
    uuid: string,
    ctor: IAccessoryCtor<AT>,
    context: AC,
  ) {
    const _cachedAccessory = this._cacheManager.remove(uuid);

    if (_cachedAccessory) {
      _cachedAccessory.context = {...context};

      this._accessories.set(uuid, new ctor(
        this.logger,
        this.api,
        this.platform,
        _cachedAccessory
      ));

      this.logger.debug('Updating accessory:', uuid, _cachedAccessory.displayName);

      return this.api.updatePlatformAccessories([_cachedAccessory]);
    } else {
      const _accessory = new this.api.platformAccessory(context.name, uuid);

      _accessory.context = {...context};

      this._accessories.set(uuid, new ctor(
        this.logger,
        this.api,
        this.platform,
        _accessory as PlatformAccessory<AC>
      ));

      this.logger.debug('Registering accessory:', uuid, _accessory.displayName);

      this.api.registerPlatformAccessories(
        this.pluginName,
        this.platformName,
        [_accessory],
      );
    }
  }

  unregister(uuid: string, accessory: PlatformAccessory<AC>) {
    this.api.unregisterPlatformAccessories(
      this.pluginName,
      this.platformName,
      [accessory],
    );

    if (this._accessories.has(uuid)) {
      this._accessories.delete(uuid);
    }

    this.logger.debug('Unregistering accessory:', uuid, accessory.displayName);
  }
}
