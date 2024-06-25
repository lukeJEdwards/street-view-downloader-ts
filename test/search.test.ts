import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'

import { searchPanorama, searchPanoramas } from '../src'

const instance = axios.create()

describe('search for a panorama', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('get back panaorama object', async () => {
    // testing coords
    const lat = 51.483455
    const lon = -0.047694

    const result = await searchPanorama(instance, lat, lon)

    expect(result).toEqual({
      pano_id: 'qh8Ky4IaeYkqNRChwVo_XQ',
      lat: 51.48363288862294,
      lon: -0.04689417113956987,
      heading: 334.7780456542969,
      pitch: 88.11132049560547,
      roll: 358.5204467773438,
      date: '2021-04',
    })
  })
})

describe('search for panoramas', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('get back panaorama objects', async () => {
    // testing coords
    const locations = [
      {
        lat: 51.483455,
        lon: -0.047694,
      },
      {
        lat: 51.483455,
        lon: -0.047694,
      },
    ]

    const result = await searchPanoramas(instance, locations)

    expect(result).toEqual([{
      pano_id: 'qh8Ky4IaeYkqNRChwVo_XQ',
      lat: 51.48363288862294,
      lon: -0.04689417113956987,
      heading: 334.7780456542969,
      pitch: 88.11132049560547,
      roll: 358.5204467773438,
      date: '2021-04',
    }, {
      pano_id: 'qh8Ky4IaeYkqNRChwVo_XQ',
      lat: 51.48363288862294,
      lon: -0.04689417113956987,
      heading: 334.7780456542969,
      pitch: 88.11132049560547,
      roll: 358.5204467773438,
      date: '2021-04',
    }])
  })
})
