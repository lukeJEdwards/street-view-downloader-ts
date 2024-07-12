import { Buffer } from 'node:buffer'

import { loadImage } from 'canvas'
import axios from 'axios'

import type { Image } from 'canvas'
import type { AxiosResponse } from 'axios'
import type { MetaData } from './types'

/**
 * Fetches metadata for a given panorama ID using the Google Maps Street View API.
 *
 * @param {string} pano_id - The panorama ID.
 * @param {string} api_key - Your API key.
 * @returns {Promise<MetaData>} - The metadata for the panorama.
 */
export async function getPanoramaMeta(pano_id: string, api_key: string): Promise<MetaData> {
  const url = `https://maps.googleapis.com/maps/api/streetview/metadata?pano=${pano_id}&key=${api_key}`
  const response: AxiosResponse = await axios.get(url)
  return response.data as MetaData
}

/**
 * Fetches a Street View image using the Google Maps Street View API.
 *
 * @param {string} pano_id - The panorama ID.
 * @param {string} api_key - Your API key.
 * @param {number} [width] - The width of the image.
 * @param {number} [height] - The height of the image.
 * @param {number} [heading] - The heading of the photo.
 * @param {number} [fov] - The field of view of the image.
 * @param {number} [pitch] - The pitch of the image.
 * @returns {Promise<Image>} - The fetched image.
 */
export async function getStreetView(
  pano_id: string,
  api_key: string,
  width: number = 640,
  height: number = 640,
  heading: number = 0,
  fov: number = 120,
  pitch: number = 0,
): Promise<Image> {
  const url = 'https://maps.googleapis.com/maps/api/streetview'
  const params = {
    size: `${width}x${height}`,
    fov: fov.toString(),
    pitch: pitch.toString(),
    heading: heading.toString(),
    pano: pano_id,
    key: api_key,
  }

  const response: AxiosResponse = await axios.get(url, { params, responseType: 'arraybuffer' })
  const img = loadImage(Buffer.from(response.data, 'binary'))
  return img
}
