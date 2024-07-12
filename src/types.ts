import type { Image } from 'canvas'

export type Location = [lat: number, lon: number]

export interface Panorama {
  pano_id: string
  pos: Location
  heading: number
  pitch?: number
  roll?: number
  date?: Date
}

export interface Tile {
  x: number
  y: number
  image: Image
}

export interface TileInfo {
  x: number
  y: number
  fileurl: string
}

export interface MetaData {
  pano_id: string
  location: Location
  date: string
  copyright: string
}
