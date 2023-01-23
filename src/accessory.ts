import {API, ConstructorArgs, Logger, PlatformAccessory, Service, WithUUID} from 'homebridge';
import {IBaseAccessoryContext} from './accessory.context';

export interface IBaseAccessoryCtor<T> {
  new(
    $_api: API,
    _accessory: PlatformAccessory<IBaseAccessoryContext>,
    $_logger?: Logger,
  ): T;
}

export abstract class BaseAccessory<AC extends IBaseAccessoryContext> {
  protected constructor(
    protected readonly $_api: API,
    protected readonly _accessory: PlatformAccessory<AC>,
    protected readonly $_logger?: Logger,
  ) {
  }

  protected _setAccessoryInformation(
    manufacturer: string,
    model: string,
    serialNumber: string,
    version: string,
  ) {
    this._accessory.getService(this.$_api.hap.Service.AccessoryInformation)!
      .setCharacteristic(this.$_api.hap.Characteristic.Manufacturer, manufacturer)
      .setCharacteristic(this.$_api.hap.Characteristic.Model, model)
      .setCharacteristic(this.$_api.hap.Characteristic.SerialNumber, serialNumber)
      .setCharacteristic(this.$_api.hap.Characteristic.FirmwareRevision, version);
  }

  protected _getService<T extends WithUUID<typeof Service>>(
    name: string,
    service: T,
  ): Service {
    return (
      this._accessory.getService(service)
      || this._accessory.addService(service, ...([name] as unknown as ConstructorArgs<T>))
    )
      .setCharacteristic(this.$_api.hap.Characteristic.Name, name);
  }

  protected _removeService<T extends WithUUID<typeof Service>>(
    service: T,
  ): void {
    const _service = this._accessory.getService(service);
    if (_service) {
      this._accessory.removeService(_service);
    }
  }
}
