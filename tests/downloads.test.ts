import { createHash } from 'node:crypto'
import type { Buffer } from 'node:buffer'

import axios from 'axios'
import { createCanvas } from 'canvas'
import { describe, expect, it } from 'vitest'

import { fetchPanoramaTile, getPanorama, getWidthAndHeightFromZoom, iterTileInfo, iterTilesAsync, makeDownloadUrl } from '../src/download'

const session = axios.create()

const mockPanoId = '_R1mwpMkiqa2p0zp48EBJg'
const mockZoom = 2

const mockKnownTileHashes = [
  'd170a7e1aeaebc45f9fda35f1bb29469',
  '27f2d893050de0f61016085b341e4eb2',
  '956f8509218fd27dd4b0b0b08c1a35f5',
  '37abf2bc7fed964b9fc39bb9a37ed5ee',
  'f2f3cc21f542e9e058fe16146ef9a55e',
  '90ca1cef669985bcacb2afb849fae215',
  '9517196e8cedebd67c44f3c99adce39f',
  '0579bd4064f9047f9091e744e8488576',
]
const mockKnownHashPano = '21beaea255d772e010365bd2ebcc1d02'

function hashBuffer(buffer: Buffer) {
  const md5 = createHash('md5').update(buffer)
  return md5.digest('hex')
}

describe.concurrent('getWidthAndHeightFromZoom', () => {
  it.each([
    [0, 1, 0.5],
    [1, 2, 1],
    [2, 4, 2],
    [3, 8, 4],
    [4, 16, 8],
    [5, 32, 16],
    [6, 64, 32],
    [7, 128, 64],
    [8, 256, 128],
    [9, 512, 256],
  ])('should return correct width and height for zoom level %i', async (zoom, _width, _height) => {
    const [width, height] = getWidthAndHeightFromZoom(zoom)
    expect(width).toBe(_width)
    expect(height).toBe(_height)
  })
})

describe.concurrent('makeDownloadUrl', () => {
  it.each([
    ['examplePanoId', 0, 0, 0, 'https://cbk0.google.com/cbk?output=tile&panoid=examplePanoId&zoom=0&x=0&y=0'],
    ['examplePanoId', 5, 0, 0, 'https://cbk0.google.com/cbk?output=tile&panoid=examplePanoId&zoom=5&x=0&y=0'],
    ['examplePanoId', 5, 0, 0, 'https://cbk0.google.com/cbk?output=tile&panoid=examplePanoId&zoom=5&x=0&y=0'],
    ['examplePanoId', 5, 0, 0, 'https://cbk0.google.com/cbk?output=tile&panoid=examplePanoId&zoom=5&x=0&y=0'],
    ['examplePanoId', 0, 0, 0, 'https://cbk0.google.com/cbk?output=tile&panoid=examplePanoId&zoom=0&x=0&y=0'],
    ['examplePanoId', 1, 0, 0, 'https://cbk0.google.com/cbk?output=tile&panoid=examplePanoId&zoom=1&x=0&y=0'],
    ['examplePanoId', 5, 1, 0, 'https://cbk0.google.com/cbk?output=tile&panoid=examplePanoId&zoom=5&x=1&y=0'],
    ['examplePanoId', 5, 0, 1, 'https://cbk0.google.com/cbk?output=tile&panoid=examplePanoId&zoom=5&x=0&y=1'],
    ['examplePanoId', 5, 1, 1, 'https://cbk0.google.com/cbk?output=tile&panoid=examplePanoId&zoom=5&x=1&y=1'],
    ['examplePanoId', 1, 1, 1, 'https://cbk0.google.com/cbk?output=tile&panoid=examplePanoId&zoom=1&x=1&y=1'],
  ])('should construct the correct URL for given parameters', (panoId, zoom, x, y, expected) => {
    const url = makeDownloadUrl(panoId, zoom, x, y)
    expect(url).toBe(expected)
  })
})

describe.concurrent('fetchPanoramaTile', () => {
  it.each([
    [0, { x: 0, y: 0, fileurl: 'https://cbk0.google.com/cbk?output=tile&panoid=_R1mwpMkiqa2p0zp48EBJg&zoom=2&x=0&y=0' }],
    [1, { x: 0, y: 1, fileurl: 'https://cbk0.google.com/cbk?output=tile&panoid=_R1mwpMkiqa2p0zp48EBJg&zoom=2&x=0&y=1' }],
    [2, { x: 1, y: 0, fileurl: 'https://cbk0.google.com/cbk?output=tile&panoid=_R1mwpMkiqa2p0zp48EBJg&zoom=2&x=1&y=0' }],
    [3, { x: 1, y: 1, fileurl: 'https://cbk0.google.com/cbk?output=tile&panoid=_R1mwpMkiqa2p0zp48EBJg&zoom=2&x=1&y=1' }],
    [4, { x: 2, y: 0, fileurl: 'https://cbk0.google.com/cbk?output=tile&panoid=_R1mwpMkiqa2p0zp48EBJg&zoom=2&x=2&y=0' }],
    [5, { x: 2, y: 1, fileurl: 'https://cbk0.google.com/cbk?output=tile&panoid=_R1mwpMkiqa2p0zp48EBJg&zoom=2&x=2&y=1' }],
    [6, { x: 3, y: 0, fileurl: 'https://cbk0.google.com/cbk?output=tile&panoid=_R1mwpMkiqa2p0zp48EBJg&zoom=2&x=3&y=0' }],
    [7, { x: 3, y: 1, fileurl: 'https://cbk0.google.com/cbk?output=tile&panoid=_R1mwpMkiqa2p0zp48EBJg&zoom=2&x=3&y=1' }],
  ])('', async (i, tileInfo) => {
    const image = await fetchPanoramaTile(session, tileInfo)
    const canvas = createCanvas(512, 512)
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)

    expect(hashBuffer(canvas.toBuffer())).toEqual(mockKnownTileHashes[i])
  })
})

describe('iterTileInfo', () => {
  it('should generate tile information for the given zoom level & panoId', () => {
    const tiles = Array.from(iterTileInfo(mockPanoId, mockZoom))

    expect(tiles).toHaveLength(8)
    expect(tiles).toEqual([
      { x: 0, y: 0, fileurl: 'https://cbk0.google.com/cbk?output=tile&panoid=_R1mwpMkiqa2p0zp48EBJg&zoom=2&x=0&y=0' },
      { x: 0, y: 1, fileurl: 'https://cbk0.google.com/cbk?output=tile&panoid=_R1mwpMkiqa2p0zp48EBJg&zoom=2&x=0&y=1' },
      { x: 1, y: 0, fileurl: 'https://cbk0.google.com/cbk?output=tile&panoid=_R1mwpMkiqa2p0zp48EBJg&zoom=2&x=1&y=0' },
      { x: 1, y: 1, fileurl: 'https://cbk0.google.com/cbk?output=tile&panoid=_R1mwpMkiqa2p0zp48EBJg&zoom=2&x=1&y=1' },
      { x: 2, y: 0, fileurl: 'https://cbk0.google.com/cbk?output=tile&panoid=_R1mwpMkiqa2p0zp48EBJg&zoom=2&x=2&y=0' },
      { x: 2, y: 1, fileurl: 'https://cbk0.google.com/cbk?output=tile&panoid=_R1mwpMkiqa2p0zp48EBJg&zoom=2&x=2&y=1' },
      { x: 3, y: 0, fileurl: 'https://cbk0.google.com/cbk?output=tile&panoid=_R1mwpMkiqa2p0zp48EBJg&zoom=2&x=3&y=0' },
      { x: 3, y: 1, fileurl: 'https://cbk0.google.com/cbk?output=tile&panoid=_R1mwpMkiqa2p0zp48EBJg&zoom=2&x=3&y=1' },
    ])
  })
})

describe('iterTilesAsync', () => {
  it('should generate 8 known md5 hashes from panorama', async () => {
    const result_arr = []

    for await (const tile of iterTilesAsync(session, mockPanoId, mockZoom)) {
      const canvas = createCanvas(512, 512)
      const context = canvas.getContext('2d')
      context.drawImage(tile.image, 0, 0)

      result_arr.push(hashBuffer(canvas.toBuffer()))
    }

    expect(result_arr).toEqual(mockKnownTileHashes)
  })
})

describe('getPanorama', () => {
  it('download full panorama', async () => {
    const buffer = await getPanorama(session, mockPanoId, mockZoom)
    expect(hashBuffer(buffer)).toEqual(mockKnownHashPano)
  })
})
