// download panorama from Google street view
// google - streetview 1.2.9 https://pypi.org/project/google-streetview/
// Modified the files to all for concurrency for faster download performance.

import * as fs from 'node:fs'
import { Buffer } from 'node:buffer'
import { Image, createCanvas, loadImage } from 'canvas'

import type { AxiosInstance } from 'axios'
import type { tile } from '../types'

/**
 *
 * A function for calculating the width and height of the panorama
 * in tiles
 *
 * @param zoom zoom of the panarama
 * @returns tuple for the width and hight of the panorama
 */
export function getWidthAndHeightFromZoom(zoom: number): [number, number] {
  return [2 ** zoom, 2 ** (zoom - 1)]
}

/**
 *
 * A function for creating the url of the tile in a panorama
 *
 * @param panoId panorama id
 * @param zoom the zoom on the panorama
 * @param x x position of the tile on the panorama
 * @param y x position of the tile on the panorama
 * @returns url for the tile
 */
export function makeDownloadUrl(panoId: string, zoom: number, x: number, y: number): string {
  return `https://cbk0.google.com/cbk?output=tile&panoid=${panoId}&zoom=${zoom}&x=${x}&y=${y}`
}

/**
 *
 * A function for fetching a tile for the panorama
 *
 * @param session The Axios session for getting the tile
 * @param tileInfo the tile infomation
 * @returns canvas Image object
 */
export async function fetchPanoramaTile(session: AxiosInstance, tileInfo: tile): Promise<Image> {
  try {
    const response = await session.get(tileInfo.fileURL, { responseType: 'arraybuffer' })
    const image = await loadImage(Buffer.from(response.data))
    return image
  }
  catch (error) {
    return new Image()
  }
}

/**
 *
 * A function for creating the url and location of every tile in a panorama
 *
 * @param panoId panorama id
 * @param zoom the zoom on the panorama
 * @returns Array of tileInfo object containing position x, y and url
 */
export function getTileInfo(panoId: string, zoom: number): tile[] {
  const tileInfo: tile[] = []
  const [width, height] = getWidthAndHeightFromZoom(zoom)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const url = makeDownloadUrl(panoId, zoom, x, y)
      tileInfo.push({ x, y, fileURL: url, image: new Image() })
    }
  }
  return tileInfo
}

/**
 *
 * A function for getting all tiles as canvas images
 *
 * @param session The Axios session for getting the tile
 * @param panoId panorama id
 * @param zoom the zoom on the panorama
 * @returns An array of Tile objects that contain position x, y and the canvas Image object of the tile
 */
export async function getTiles(session: AxiosInstance, panoId: string, zoom: number): Promise<tile[] | null> {
  const tiles = getTileInfo(panoId, zoom)
  const images = await Promise.all(tiles.map(info => fetchPanoramaTile(session, info)))

  tiles.forEach((tile, i) => tile.image = images[i])

  return tiles
}

/**
 *
 * A function download a panorama from google street view
 *
 * @param session The Axios session for getting the tile
 * @param panoId panorama id
 * @param destination location to save the image
 * @param fileName name of the saved file
 * @param zoom the zoom on the panorama
 * @returns void
 */
export async function getPanorama(session: AxiosInstance, panoId: string, destination: string, fileName: string = 'image', zoom: number = 5): Promise<void> {
  const tileWidth = 512
  const tileHeight = 512
  const [totalWidth, totalHeight] = getWidthAndHeightFromZoom(zoom)

  const canvas = createCanvas(totalWidth * tileWidth, totalHeight * tileHeight)
  const ctx = canvas.getContext('2d')

  const tiles = await getTiles(session, panoId, zoom)

  if (tiles === null)
    throw new Error('Error: Request contains an invalid argument')

  for (const tile of tiles)
    ctx.drawImage(tile.image, tile.x * tileWidth, tile.y * tileHeight, tileWidth, tileHeight)

  const buffer = canvas.toBuffer('image/jpeg')
  fs.writeFileSync(`${destination}/${fileName}.jpg`, buffer)
}
