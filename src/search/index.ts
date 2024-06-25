import type { AxiosInstance } from 'axios'
import type { location, panorama } from '../types'

/**
 *
 * A function for making the url string for getting a locations panaorma
 *
 * @param lat latitude of the location
 * @param lon lonitude of the location
 * @returns url string for getting the location panorama
 */
function makeSearchUrl(lat: number, lon: number): string {
  return `https://maps.googleapis.com/maps/api/js/GeoPhotoService.SingleImageSearch?pb=!1m5!1sapiv3!5sUS!11m2!1m1!1b0!2m4!1m2!3d${lat}!4d${lon}!2d50!3m10!2m2!1sen!2sGB!9m1!1e2!11m4!1m3!1e2!2b1!3e2!4m10!1e1!1e2!1e3!1e4!1e8!1e6!5m1!1e2!6m1!1e2&callback=callbackfunc`
}

/**
 *
 * A function for parse the response of the url get request
 *
 * @param text stringify test from the url get request
 * @returns A list of objects of type panorama
 */

function extractPanoramas(text: string): panorama[] {
  // The response is actually JavaScript code. It's a function with a single
  // input which is a huge deeply nested array of items.
  const blobMatch = text.match(/callbackfunc\( (.*) \)$/)
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
  const dates = rawDates.reverse().map((d: any) => `${d[1][0]}-${String(d[1][1]).padStart(2, '0')}`)

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
 *
 * A function for find the infomation for one panorama
 *
 * @param session Axios client for the get request
 * @param lat latitude of the location
 * @param lon lonitude of the location
 * @returns return either a panorama object or and empty list if none was found
 */
export async function searchPanorama(session: AxiosInstance, lat: number, lon: number): Promise<panorama | panorama[]> {
  const url = makeSearchUrl(lat, lon)
  const response = await session.get<string>(url)
  const panoramas = extractPanoramas(response.data)
  const sortedPanoramas = panoramas.filter(pan => pan.date).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  return sortedPanoramas.length > 0 ? sortedPanoramas[0] : panoramas
}

/**
 *
 * @param session Axios client for the get request
 * @param locations array of locations
 * @returns list panorama for each location provided
 */
export async function searchPanoramas(session: AxiosInstance, locations: location[]): Promise<panorama[]> {
  const results = await Promise.all(locations.map(async location => await searchPanorama(session, location.lat, location.lon)))
  return results.filter(p => !Array.isArray(p)) as panorama[]
}
