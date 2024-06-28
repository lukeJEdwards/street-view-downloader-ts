import type { Image } from 'canvas'

/**
 * location type
 */
export type location = [lat: number, lon: number]

/**
 * panorama info infomation
 */
export interface panorama {
  readonly pano_id: string
  readonly lat: number
  readonly lon: number
  readonly heading: number
  readonly pitch?: number
  readonly roll?: number
  readonly date?: string
}

/**
 * Tile infomation
 */
export interface tile {
  readonly x: number
  readonly y: number
  readonly fileURL: string

  image: Image
}
