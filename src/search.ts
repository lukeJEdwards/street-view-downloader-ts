import type { AxiosInstance } from 'axios'
import type { Location, Panorama } from './types'

/**
 * Generates a search URL for a given latitude and longitude.
 *
 * @param {number} lat - The latitude.
 * @param {number} lon - The longitude.
 * @returns {string} - The generated search URL.
 */
export function makeSearchUrl(lat: number, lon: number): string {
  return `https://maps.googleapis.com/maps/api/js/GeoPhotoService.SingleImageSearch?pb=!1m5!1sapiv3!5sUS!11m2!1m1!1b0!2m4!1m2!3d${lat}!4d${lon}!2d50!3m10!2m2!1sen!2sGB!9m1!1e2!11m4!1m3!1e2!2b1!3e2!4m10!1e1!1e2!1e3!1e4!1e8!1e6!5m1!1e2!6m1!1e2&callback=callbackfunc`
}

/**
 * Parses a URL to extract the latitude, longitude, and a string identifier.
 *
 * @param {string} url - The URL to parse.
 * @returns {[number, number, string]} - An array containing the latitude, longitude, and identifier.
 */
export function parseURL(url: string): [number, number, string] {
  // eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/no-misleading-capturing-group, regexp/optimal-quantifier-concatenation
  const regex = url.match(/\/@([-+]?\d+.\d+),([-+]?\d+.\d+).+!1s(.+)!2e/)

  if (!regex)
    return [0, 0, '']

  return [Number(regex[1]), Number(regex[2]), regex[3]]
}

/**
 * Extracts panorama data from a response text.
 *
 * @param {string} text - The response text.
 * @returns {Panorama[]} - An array of panorama objects.
 */
export function extractPanoramas(text: string): Panorama[] {
  // The response is actually JavaScript code. It's a function with a single
  // input which is a huge deeply nested array of items.
  if (text.indexOf('\''))
    text = text.replace(/'/g, '"')

  const blobMatch = text.match(/callbackfunc\((.*)\)/)
  if (!blobMatch)
    return []
  const blob = blobMatch[1]

  const data = JSON.parse(blob)

  if (JSON.stringify(data) === JSON.stringify([[5, 'generic', 'Search returned no images.']]))
    return []

  const subset = data[1][5][0]
  let rawPanos = subset[3][0]

  const rawDates = subset.length < 9 || subset[8] == null ? [] : subset[8]

  // Flip arrays so that the 0th pano aligns with the 0th date.
  rawPanos = rawPanos.reverse()
  const dates = rawDates.reverse().map((d: any) => new Date(d[1][0], d[1][1]))

  return rawPanos.map((pano: any, i: number) => ({
    pano_id: pano[0][1],
    lat: pano[2][0][2],
    lon: pano[2][0][3],
    heading: pano[2][2][0],
    pitch: pano[2][2][1] ?? null,
    roll: pano[2][2][2] ?? null,
    date: dates[i] ?? null,
  })).filter((pano: any) => pano.pano_id && pano.lat && pano.lon && pano.heading != null)
}

/**
 * Searches for panoramas at a given latitude and longitude.
 *
 * @param {AxiosInstance} session - The Axios instance for making HTTP requests.
 * @param {number} lat - The latitude.
 * @param {number} lon - The longitude.
 * @returns {Promise<Panorama[]>} - A promise that resolves to an array of panoramas.
 */
export async function searchPanorama(session: AxiosInstance, lat: number, lon: number): Promise<Panorama[]> {
  const url = makeSearchUrl(lat, lon)
  const response = await session.get<string>(url)
  const panoramas = extractPanoramas(response.data)

  const sortedPanoramas = panoramas.sort((a: Panorama, b: Panorama) => {
    if (a.date && b.date)
      return b.date.getTime() - a.date.getTime()
    return 0
  })

  return sortedPanoramas
}

/**
 * Searches for panoramas at multiple locations.
 *
 * @param {AxiosInstance} session - The Axios instance for making HTTP requests.
 * @param {Location[]} locations - An array of locations, each specified by latitude and longitude.
 * @returns {Promise<Panorama[][]>} - A promise that resolves to an array of arrays of panoramas.
 */
export async function searchPanoramas(session: AxiosInstance, locations: Location[]): Promise<Panorama[][]> {
  return await Promise.all(locations.map(async location => await searchPanorama(session, location[0], location[1])))
}

/**
 * Searches for panoramas using a URL and optionally filters by exact panorama ID.
 *
 * @param {AxiosInstance} session - The Axios instance for making HTTP requests.
 * @param {string} url - The URL to search.
 * @param {boolean} [exact] - Whether to filter by exact panorama ID.
 * @returns {Promise<Panorama[]>} - A promise that resolves to an array of panoramas.
 */
export async function searchPanoramaURL(session: AxiosInstance, url: string, exact: boolean = false): Promise<Panorama[]> {
  const [lat, lon, id] = parseURL(url)
  const panos = await searchPanorama(session, lat, lon)
  return exact ? panos.filter(p => p.pano_id === id) : panos
}

/**
 * Searches for panoramas using multiple URLs and optionally filters by exact panorama ID.
 *
 * @param {AxiosInstance} session - The Axios instance for making HTTP requests.
 * @param {string[]} urls - An array of URLs to search.
 * @param {boolean} [exact] - Whether to filter by exact panorama ID.
 * @returns {Promise<Panorama[][]>} - A promise that resolves to an array of arrays of panoramas.
 */
export async function searchPanoramaURLs(session: AxiosInstance, urls: string[], exact: boolean = false): Promise<Panorama[][]> {
  return await Promise.all(urls.map(async url => await searchPanoramaURL(session, url, exact)))
}
