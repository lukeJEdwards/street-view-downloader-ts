import * as fs from 'node:fs'
import { Buffer } from 'node:buffer'
import { join } from 'node:path'
import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'

// Import the functions to be tested from the second file
import {
  fetchPanoramaTile,
  getTileInfo,
  getWidthAndHeightFromZoom,
  makeDownloadUrl,
} from './index'

// Mock data for testing
const panoId = 'UpvOHBL_dHPIaRf3Wmdo0Q'
const zoom = 5
const mockResponseTile = Buffer.from(JSON.parse(fs.readFileSync(join(__dirname, 'mockResponseTile.json'), 'utf-8')).data)
const mockTileInfo = {
  x: 9,
  y: 3,
  fileURL: 'https://cbk0.google.com/cbk?output=tile&panoid=UpvOHBL_dHPIaRf3Wmdo0Q&zoom=5&x=9&y=3',
}

describe('getWidthAndHeightFromZoom', () => {
  it('should return correct width and height for given zoom level', () => {
    const [width, height] = getWidthAndHeightFromZoom(5)
    expect(width).toBe(32)
    expect(height).toBe(16)
  })
})

describe('makeDownloadUrl', () => {
  it('should create a valid download URL for panorama tile', () => {
    const url = makeDownloadUrl(panoId, zoom, mockTileInfo.x, mockTileInfo.y)
    expect(url).toBe(`https://cbk0.google.com/cbk?output=tile&panoid=${panoId}&zoom=${zoom}&x=${mockTileInfo.x}&y=${mockTileInfo.y}`)
  })
})

describe('fetchPanoramaTile', () => {
  const session = axios.create()

  it('should fetch and return an image from given tileInfo', async () => {
    vi.spyOn(session, 'get').mockResolvedValueOnce({ data: mockResponseTile })
    const image = await fetchPanoramaTile(session, mockTileInfo)
    expect(image).toBeDefined()
  })
})

// Example:
describe('getTileInfo', () => {
  it('should generate tileInfo array for given panorama ID and zoom level', () => {
    const tileInfo = getTileInfo(panoId, zoom)
    expect(tileInfo).toHaveLength(512)
  })
})
