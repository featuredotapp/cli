import * as api from '../api'

export default function resolveAddAccessoryRequestFrom(
  accessory: any,
): api.AddSmsAccessoryRequest | api.AddMailscriptEmailAccessoryRequest {
  switch (accessory.type) {
    case 'mailscript-email':
      return {
        name: accessory.name,
        type: accessory.type,
        address: accessory.address,
        key: accessory.key,
      }
    case 'sms':
      return {
        name: accessory.name,
        type: accessory.type,
        sms: accessory.sms,
      }
    default:
      throw new Error(`Unknown accessory type: ${accessory.type}`)
  }
}
