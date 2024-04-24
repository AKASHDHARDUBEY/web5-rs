import { LocalJwkManager } from '../pkg'

describe('LocalJwkManager', () => {
  let keyManager: LocalJwkManager

  beforeEach(() => {
    keyManager = new LocalJwkManager()
  })

  test('should override key_alias', () => {
    const keyAliasOverride = 'key-id-123'
    const keyAlias = keyManager.generatePrivateKey('Secp256k1', keyAliasOverride)
    expect(keyAlias).toEqual(keyAliasOverride)
  })

  test('should generate and retrieve Secp256k1 private key', () => {
    const keyAlias = keyManager.generatePrivateKey('Secp256k1')
    expect(typeof keyAlias).toBe('string')

    const publicKey = keyManager.getPublicKey(keyAlias)
    expect(publicKey).toBeDefined()
    expect(publicKey.alg).toBe('ES256K')
    expect(publicKey.kty).toBe('EC')
    expect(publicKey.crv).toBe('secp256k1')
    expect(publicKey.x).toBeDefined()
    expect(publicKey.y).toBeDefined()
  })

  test('should generate and retrieve Ed25519 private key', () => {
    const keyAlias = keyManager.generatePrivateKey('Ed25519')
    expect(typeof keyAlias).toBe('string')

    const publicKey = keyManager.getPublicKey(keyAlias)
    expect(publicKey).toBeDefined()
    expect(publicKey.alg).toBe('EdDSA')
    expect(publicKey.kty).toBe('OKP')
    expect(publicKey.crv).toBe('Ed25519')
    expect(publicKey.x).toBeDefined()
  })

  test('should sign and verify using Secp256k1', () => {
    const keyAlias = keyManager.generatePrivateKey('Secp256k1')
    const publicKey = keyManager.getPublicKey(keyAlias)

    const payload = new TextEncoder().encode('test message')
    const signature = keyManager.sign(keyAlias, payload)
    expect(signature).toBeDefined()

    const verified = publicKey.verify(payload, signature)
    expect(verified).toBeUndefined()
  })

  test('should sign and verify using Ed25519', () => {
    const keyAlias = keyManager.generatePrivateKey('Ed25519')
    const publicKey = keyManager.getPublicKey(keyAlias)

    const payload = new TextEncoder().encode('test message')
    const signature = keyManager.sign(keyAlias, payload)
    expect(signature).toBeDefined()

    const verified = publicKey.verify(payload, signature)
    expect(verified).toBeUndefined()
  })

  test('should export and import private keys', () => {
    const keyAlias1 = keyManager.generatePrivateKey('Secp256k1')
    const keyAlias2 = keyManager.generatePrivateKey('Ed25519')

    const exportedKeys = keyManager.exportPrivateKeys()
    expect(exportedKeys.length).toBe(2)

    const newKeyManager = new LocalJwkManager()
    newKeyManager.importPrivateKeys(exportedKeys)

    const publicKey1 = newKeyManager.getPublicKey(keyAlias1)
    expect(publicKey1).toBeDefined()

    const publicKey2 = newKeyManager.getPublicKey(keyAlias2)
    expect(publicKey2).toBeDefined()
  })
})