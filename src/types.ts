/**
 * location type
 */
export interface location {
  lat: number
  lon: number
}

/**
 * panorama info infomation
 */
export interface panorama {
  pano_id: string
  lat: number
  lon: number
  heading: number
  pitch?: number
  roll?: number
  date?: string
}
