import * as fs from 'node:fs'
import { Buffer } from 'node:buffer'

import type { AxiosInstance, AxiosResponse } from 'axios'
import type { Image } from 'canvas'
import { createCanvas, loadImage } from 'canvas'

import axios from 'axios'
import type { Tile, TileInfo } from '../types'

function getWidthAndHeightFromZoom(zoom: number): [number, number] {
  return [2 ** zoom, 2 ** (zoom - 1)]
}

function makeDownloadUrl(panoId: string, zoom: number, x: number, y: number): string {
  return `https://cbk0.google.com/cbk?output=tile&panoid=${panoId}&zoom=${zoom}&x=${x}&y=${y}`
}

async function fetchPanoramaTile(session: AxiosInstance, tileInfo: TileInfo): Promise<Image | null> {
  try {
    const response: AxiosResponse = await axios.get(tileInfo.fileURL, { responseType: 'arraybuffer' })
    const image = await loadImage(Buffer.from(response.data))
    return image
  }
  catch (error) {
    // Connection error. Trying again in 2 seconds.
    await new Promise(resolve => setTimeout(resolve, 2000))
    return await fetchPanoramaTile(session, tileInfo)
  }
}

function getTileInfo(panoId: string, zoom: number): TileInfo[] {
  const tileInfo: TileInfo[] = []
  const [width, height] = getWidthAndHeightFromZoom(zoom)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const url = makeDownloadUrl(panoId, zoom, x, y)
      tileInfo.push({ x, y, fileURL: url })
    }
  }
  return tileInfo
}

async function getTiles(session: AxiosInstance, panoId: string, zoom: number): Promise<Tile[] | null> {
  const tileInfo = getTileInfo(panoId, zoom)
  const images = await Promise.all(tileInfo.map(info => fetchPanoramaTile(session, info)))

  if (images.includes(null))
    return null

  const tiles: Tile[] = tileInfo.map((info, i) => ({
    x: info.x,
    y: info.y,
    image: images[i] as Image,
  }))

  return tiles
}

export async function getPanorama(session: AxiosInstance, panoId: string, destination: string, index: number, zoom: number = 5): Promise<void> {
  const tileWidth = 512
  const tileHeight = 512
  const [totalWidth, totalHeight] = getWidthAndHeightFromZoom(zoom)

  const canvas = createCanvas(totalWidth * tileWidth, totalHeight * tileHeight)
  const ctx = canvas.getContext('2d')

  const tiles = await getTiles(session, panoId, zoom)

  if (tiles === null) {
    // Error: Request contains an invalid argument.
    return
  }

  for (const tile of tiles)
    ctx.drawImage(tile.image, tile.x * tileWidth, tile.y * tileHeight, tileWidth, tileHeight)

  const buffer = canvas.toBuffer('image/jpeg')
  fs.writeFileSync(`${destination}/image-${index}.jpg`, buffer)
}
