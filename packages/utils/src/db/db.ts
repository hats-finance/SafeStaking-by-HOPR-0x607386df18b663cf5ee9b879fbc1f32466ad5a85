import { stat, mkdir, rm } from 'fs/promises'
import { debug } from '../process/index.js'

import fs from 'fs'
import { u8aConcat, u8aToHex } from '../u8a/index.js'
import { open, Database as Lmdb } from 'lmdb'

const log = debug(`hopr-core:db`)

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const NETWORK_KEY = encoder.encode('network_id')

export class LevelDb {
  public backend: Lmdb

  constructor() {
    // unless initialized with a specific db path, memory version is used
    this.backend = open({ encoding: 'ordered-binary', useVersions: false })
  }

  public async init(initialize: boolean, dbPath: string, forceCreate: boolean = false, networkId: string) {
    let setNetwork = false

    log(`using db at ${dbPath}`)
    if (forceCreate) {
      log('force create - wipe old database and create a new')
      await rm(dbPath, { recursive: true, force: true })
      await mkdir(dbPath, { recursive: true })
      setNetwork = true
    } else {
      let exists = false

      try {
        exists = !(await stat(dbPath)).isDirectory()
      } catch (err: any) {
        if (err.code === 'ENOENT') {
          exists = false
        } else {
          // Unexpected error, therefore throw it
          throw err
        }
      }

      if (!exists) {
        log('db directory does not exist, creating?:', initialize)
        if (initialize) {
          await mkdir(dbPath, { recursive: true })
          setNetwork = true
        } else {
          throw new Error(`Database does not exist: ${dbPath}`)
        }
      }
    }

    this.backend = open(dbPath, {encoding: 'ordered-binary', useVersions: false})

    if (setNetwork) {
      log(`setting network id ${networkId} to db`)
      await this.put(NETWORK_KEY, encoder.encode(networkId))
    } else {
      let storedNetworkId = await this.maybeGet(NETWORK_KEY)
      let decodedStoredNetworkId = storedNetworkId !== undefined ? undefined : decoder.decode(storedNetworkId)

      const hasNetworkKey = decodedStoredNetworkId !== undefined && decodedStoredNetworkId === networkId

      if (!hasNetworkKey) {
        throw new Error(`invalid db network id: ${decodedStoredNetworkId} (expected: ${networkId})`)
      }
    }
  }

  public async put(key: Uint8Array, value: Uint8Array): Promise<void> {
    await this.backend.put(key, value)
  }

  public async get(key: Uint8Array): Promise<Uint8Array> {
    let r = this.backend.get(key)
    if (r == undefined) {
       throw Error("key " + u8aToHex(key) + " not found")
    }
    return r
  }

  public async remove(key: Uint8Array): Promise<void> {
    await this.backend.remove(key)
  }

  public async batch(ops: Array<any>, _wait_for_write = true): Promise<void> {
    let transaction = () => {
      for (const op of ops) {
        if (!op.hasOwnProperty('type') || !op.hasOwnProperty('key')) {
          throw new Error('Invalid operation, missing key or type: ' + JSON.stringify(op))
        }

        if (op.type === 'put') {
          this.backend.remove(op.key) // We must try to delete first then insert (in case of updates)
          this.backend.put(op.key, op.value)
        } else if (op.type === 'del') {
          this.backend.remove(op.key)
        } else {
          throw new Error(`Unsupported operation type: ${JSON.stringify(op)}`)
        }
      }
    }

    //if (wait_for_write) {
      this.backend.transactionSync(transaction)
    //} else {
      await this.backend.transaction(transaction)
    //}
  }

  public async maybeGet(key: Uint8Array): Promise<Uint8Array | undefined> {
    return this.backend.get(key)
  }

  public iterValues(prefix: Uint8Array, suffixLength: number): AsyncIterable<Uint8Array> {
    return this.iter(prefix, suffixLength)
  }

  protected async *iter(prefix: Uint8Array, suffixLength: number): AsyncIterable<Uint8Array> {
    const firstPrefixed = u8aConcat(prefix, new Uint8Array(suffixLength).fill(0x00))
    const lastPrefixed = u8aConcat(prefix, new Uint8Array(suffixLength).fill(0xff))

    for await (let v of this.backend.getRange({
      start: firstPrefixed,
      end: lastPrefixed,
      versions: false
    })) {
      yield v.value
    }
  }

  public async close() {
    log('Closing database')
    return await this.backend.close()
  }

  public async dump(destFile: string) {
    log(`Dumping current database to ${destFile}`)
    let dumpFile = fs.createWriteStream(destFile, { flags: 'a' })
    for await (const v of this.backend.getRange()) {
      let key = v.key as Uint8Array
      let out = ''
      while (key.length > 0) {
        const nextDelimiter = key.findIndex((v: number) => v == 0x2d) // 0x2d ~= '-'

        if (key.subarray(0, nextDelimiter).every((v: number) => v >= 32 && v <= 126)) {
          out += decoder.decode(key.subarray(0, nextDelimiter))
        } else {
          out += u8aToHex(key.subarray(0, nextDelimiter))
        }

        if (nextDelimiter < 0) {
          break
        } else {
          key = (key as Buffer).subarray(nextDelimiter + 1)
        }
      }
      dumpFile.write(out + ',' + u8aToHex(v.value as Uint8Array) + '\n')
    }
    dumpFile.close()
  }

  public async setNetworkId(network_id: string): Promise<void> {
    // conversion to Buffer done by `.put()` method
    await this.put(NETWORK_KEY, encoder.encode(network_id))
  }

  public async getNetworkId(): Promise<string> {
    // conversion to Buffer done by `.get()` method
    return decoder.decode(await this.maybeGet(NETWORK_KEY))
  }

  public async verifyNetworkId(expectedId: string): Promise<boolean> {
    const storedId = await this.getNetworkId()

    if (storedId == undefined) {
      return false
    }

    return storedId === expectedId
  }
}
