import { Buffer } from 'node:buffer'

import { createCanvas, loadImage } from 'canvas'
import axios from 'axios'

import type { Image } from 'canvas'
import type { AxiosError, AxiosInstance } from 'axios'
import type { Tile, TileInfo } from './types'

const DEFAULT_MAX_RETRIES = 6

/**
 * Returns the width and height of a panorama at a given zoom level.
 *
 * @param {number} zoom - The zoom level.
 * @returns {[number, number]} The width and height.
 */
export function getWidthAndHeightFromZoom(zoom: number): [number, number] {
  return [2 ** zoom, 2 ** (zoom - 1)]
}

/**
 * Constructs the URL to download a tile.
 *
 * @param {string} panoId - The panorama ID.
 * @param {number} zoom - The zoom level.
 * @param {number} x - The x-coordinate of the tile.
 * @param {number} y - The y-coordinate of the tile.
 * @returns {string} The URL for the tile.
 */
export function makeDownloadUrl(panoId: string, zoom: number, x: number, y: number): string {
  return `https://cbk0.google.com/cbk?output=tile&panoid=${panoId}&zoom=${zoom}&x=${x}&y=${y}`
}

/**
 * Downloads a panorama tile image.
 *
 * @param {AxiosInstance} session - The Axios instance used for HTTP requests.
 * @param {TileInfo} tileInfo - Information about the tile.
 * @param {number} [maxRetries] - Maximum number of retries for downloading.
 * @returns {Promise<Image>} The downloaded tile image.
 * @throws {Error} If the maximum number of retries is exceeded.
 */
export async function fetchPanoramaTile(session: AxiosInstance, tileInfo: TileInfo, maxRetries = DEFAULT_MAX_RETRIES): Promise<Image> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await session.get(tileInfo.fileurl, { responseType: 'arraybuffer' })
      const img = loadImage(Buffer.from(response.data, 'binary'))
      return img
    }
    catch (err: unknown) {
      const error = err as Error | AxiosError
      if (axios.isAxiosError(error)) {
        console.error(`Request error: ${error.message}. Trying again in 2 seconds.`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      else {
        console.error(`Error: ${error.message}. Trying again in 2 seconds.`)
      }
    }
  }
  throw new Error('Max retries exceeded.')
}

/**
 * Generates a list of a panorama's tiles and their positions.
 *
 * @param {string} panoId - The panorama ID.
 * @param {number} zoom - The zoom level.
 * @returns {Generator<TileInfo>} A generator yielding tile information.
 */
export function* iterTileInfo(panoId: string, zoom: number): Generator<TileInfo> {
  const [width, height] = getWidthAndHeightFromZoom(zoom)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++)
      yield { x, y, fileurl: makeDownloadUrl(panoId, zoom, x, y) }
  }
}

/**
 * Asynchronously generates tiles for a panorama.
 *
 * @param {AxiosInstance} session - The Axios instance used for HTTP requests.
 * @param {string} panoId - The panorama ID.
 * @param {number} zoom - The zoom level.
 * @param {number} [maxRetries] - Maximum number of retries for downloading.
 * @returns {AsyncGenerator<Tile>} An async generator yielding tiles.
 */
export async function* iterTilesAsync(session: AxiosInstance, panoId: string, zoom: number, maxRetries = DEFAULT_MAX_RETRIES): AsyncGenerator<Tile> {
  for (const info of iterTileInfo(panoId, zoom)) {
    const image = await fetchPanoramaTile(session, info, maxRetries)
    yield { x: info.x, y: info.y, image }
  }
}

/**
 * Downloads a streetview panorama by iterating through the tiles asynchronously.
 *
 * @param {AxiosInstance} session - The Axios instance used for HTTP requests.
 * @param {string} panoId - The panorama ID.
 * @param {number} [zoom] - The zoom level.
 * @param {number} [maxRetries] - Maximum number of retries for downloading.
 * @returns {Promise<Buffer>} A promise that resolves to a Buffer containing the panorama image in JPEG format.
 */
export async function getPanorama(session: AxiosInstance, panoId: string, zoom: number = 5, maxRetries = DEFAULT_MAX_RETRIES): Promise<Buffer> {
  const tileWidth = 512
  const tileHeight = 512

  const [totalWidth, totalHeight] = getWidthAndHeightFromZoom(zoom)
  const canvas = createCanvas(totalWidth * tileWidth, totalHeight * tileHeight)
  const context = canvas.getContext('2d')

  for await (const tile of iterTilesAsync(session, panoId, zoom, maxRetries))
    context.drawImage(tile.image, tile.x * tileWidth, tile.y * tileHeight)

  return canvas.toBuffer('image/jpeg')
}
