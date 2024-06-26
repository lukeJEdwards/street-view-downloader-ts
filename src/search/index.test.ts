import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import { extractPanoramas, makeSearchUrl, searchPanorama, searchPanoramas } from './index'

// Mock data
const mockLocation = { lat: 51.5068495, lon: -0.0754049 }

const mockResponseText = readFileSync(join(__dirname, 'mockResponseText.js'), 'utf-8')

const mockPanoramaData = JSON.parse(readFileSync(join(__dirname, 'mockPanoramaData.json'), 'utf-8'))
const mockEmptyResponseText = `callbackfunc([[5,'generic','Search returned no images.']])`

describe('makeSearchUrl', () => {
  it('should create the correct URL for the given latitude and longitude', () => {
    const url = makeSearchUrl(mockLocation.lat, mockLocation.lon)
    expect(url).toBe(
      `https://maps.googleapis.com/maps/api/js/GeoPhotoService.SingleImageSearch?pb=!1m5!1sapiv3!5sUS!11m2!1m1!1b0!2m4!1m2!3d${mockLocation.lat}!4d${mockLocation.lon}!2d50!3m10!2m2!1sen!2sGB!9m1!1e2!11m4!1m3!1e2!2b1!3e2!4m10!1e1!1e2!1e3!1e4!1e8!1e6!5m1!1e2!6m1!1e2&callback=callbackfunc`,
    )
  })
})

describe('extractPanoramas', () => {
  it('should extract panoramas from the response text', () => {
    const panoramas = extractPanoramas(mockResponseText)
    expect(panoramas).toEqual(mockPanoramaData)
  })

  it('should return an empty array when no panoramas are found', () => {
    const panoramas = extractPanoramas(mockEmptyResponseText)
    expect(panoramas).toEqual([])
  })
})

describe('searchPanorama', () => {
  const session = axios.create()

  it('should return the panorama for the given location', async () => {
    vi.spyOn(session, 'get').mockResolvedValueOnce({ data: mockResponseText })
    const panorama = await searchPanorama(session, mockLocation.lat, mockLocation.lon)
    expect(panorama).toEqual(mockPanoramaData[0])
  })

  it('should return an empty array when no panorama is found', async () => {
    vi.spyOn(session, 'get').mockResolvedValueOnce({ data: mockEmptyResponseText })
    const panorama = await searchPanorama(session, mockLocation.lat, mockLocation.lon)
    expect(panorama).toEqual([])
  })
})

describe('searchPanoramas', () => {
  it('should return panoramas for each location', async () => {
    const session = axios.create()
    vi.spyOn(session, 'get').mockResolvedValue({ data: mockResponseText })

    const locations = [mockLocation, { lat: 34.052235, lon: -118.243683 }]
    const panoramas = await searchPanoramas(session, locations)
    expect(panoramas).toEqual([mockPanoramaData[0], mockPanoramaData[0]])
  })

  it('should filter out locations without panoramas', async () => {
    const session = axios.create()
    vi.spyOn(session, 'get')
      .mockResolvedValueOnce({ data: mockResponseText })
      .mockResolvedValueOnce({ data: mockEmptyResponseText })

    const locations = [mockLocation, { lat: 34.052235, lon: -118.243683 }]
    const panoramas = await searchPanoramas(session, locations)
    expect(panoramas).toEqual([mockPanoramaData[0]])
  })
})
