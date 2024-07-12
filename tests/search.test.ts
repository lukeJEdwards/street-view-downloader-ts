import axios from 'axios'
import { describe, expect, it } from 'vitest'

import { makeSearchUrl, parseURL, searchPanorama, searchPanoramaURL, searchPanoramaURLs, searchPanoramas } from '../src/search'
import type { Location } from '../src'

const session = axios.create()

const urls = [
  'https://www.google.com/maps/@-33.8796052,151.1655341,3a,75y,325.37h,90t/data=!3m7!1e1!3m5!1sRnYUqQi39Xy2mvlEhSlPCQ!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fpanoid%3DRnYUqQi39Xy2mvlEhSlPCQ%26cb_client%3Dmaps_sv.tactile.gps%26w%3D203%26h%3D100%26yaw%3D330.175%26pitch%3D0%26thumbfov%3D100!7i16384!8i8192?coh=205409&entry=ttu',
  'https://www.google.com/maps/@51.4986669,-0.1570282,3a,75y,24.91h,90t/data=!3m7!1e1!3m5!1s2DVFpbvmtBKZh7B0363tCg!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fpanoid%3D2DVFpbvmtBKZh7B0363tCg%26cb_client%3Dmaps_sv.tactile.gps%26w%3D203%26h%3D100%26yaw%3D16.125608%26pitch%3D0%26thumbfov%3D100!7i16384!8i8192?coh=205409&entry=ttu',
  'https://www.google.com/maps/@26.8623789,-34.4750281,10z?entry=ttu',
  'https://www.google.com/maps/@36.8032829,10.1808486,3a,60y,90t/data=!3m6!1e1!3m4!1sWf6Vdr6Kp9BrcXZ7x8xRlQ!2e0!7i13312!8i6656?coh=205409&entry=ttu',
]

const SYDNEY = {
  lat: -33.8796052,
  lon: 151.1655341,
}

const BELGRAVIA = {
  lat: 51.4986562,
  lon: -0.1570917,
}

const MIDDLE_OF_OCEAN = {
  lat: 28.092432,
  lon: -34.399243,
}

const TUNIS = {
  lat: 36.8032829,
  lon: 10.1808486,
}

describe.concurrent('makeSearchUrl', () => {
  it.each([
    [SYDNEY.lat, SYDNEY.lon, `https://maps.googleapis.com/maps/api/js/GeoPhotoService.SingleImageSearch?pb=!1m5!1sapiv3!5sUS!11m2!1m1!1b0!2m4!1m2!3d${SYDNEY.lat}!4d${SYDNEY.lon}!2d50!3m10!2m2!1sen!2sGB!9m1!1e2!11m4!1m3!1e2!2b1!3e2!4m10!1e1!1e2!1e3!1e4!1e8!1e6!5m1!1e2!6m1!1e2&callback=callbackfunc`],
    [BELGRAVIA.lat, BELGRAVIA.lon, `https://maps.googleapis.com/maps/api/js/GeoPhotoService.SingleImageSearch?pb=!1m5!1sapiv3!5sUS!11m2!1m1!1b0!2m4!1m2!3d${BELGRAVIA.lat}!4d${BELGRAVIA.lon}!2d50!3m10!2m2!1sen!2sGB!9m1!1e2!11m4!1m3!1e2!2b1!3e2!4m10!1e1!1e2!1e3!1e4!1e8!1e6!5m1!1e2!6m1!1e2&callback=callbackfunc`],
    [MIDDLE_OF_OCEAN.lat, MIDDLE_OF_OCEAN.lon, `https://maps.googleapis.com/maps/api/js/GeoPhotoService.SingleImageSearch?pb=!1m5!1sapiv3!5sUS!11m2!1m1!1b0!2m4!1m2!3d${MIDDLE_OF_OCEAN.lat}!4d${MIDDLE_OF_OCEAN.lon}!2d50!3m10!2m2!1sen!2sGB!9m1!1e2!11m4!1m3!1e2!2b1!3e2!4m10!1e1!1e2!1e3!1e4!1e8!1e6!5m1!1e2!6m1!1e2&callback=callbackfunc`],
    [TUNIS.lat, TUNIS.lon, `https://maps.googleapis.com/maps/api/js/GeoPhotoService.SingleImageSearch?pb=!1m5!1sapiv3!5sUS!11m2!1m1!1b0!2m4!1m2!3d${TUNIS.lat}!4d${TUNIS.lon}!2d50!3m10!2m2!1sen!2sGB!9m1!1e2!11m4!1m3!1e2!2b1!3e2!4m10!1e1!1e2!1e3!1e4!1e8!1e6!5m1!1e2!6m1!1e2&callback=callbackfunc`],
  ])('it should return the url with correct lat: %f and lon: %f', (lat, lon, _url) => {
    const url = makeSearchUrl(lat, lon)
    expect(url).toEqual(_url)
  })
})

describe.concurrent('parseURL', () => {
  it.each([
    [SYDNEY.lat, SYDNEY.lon, 'gCG5OmLnEufaCHu9MyH6FA', 'https://www.google.com/maps/@-33.8796052,151.1655341,3a,75y,114.29h,77.17t/data=!3m7!1e1!3m5!1sgCG5OmLnEufaCHu9MyH6FA!2e0!6s'],
    [BELGRAVIA.lat, BELGRAVIA.lon, 'gCG5OmLnEufaCHu9MyH6FA', 'https://www.google.com/maps/@51.4986562,-0.1570917,3a,75y,114.29h,77.17t/data=!3m7!1e1!3m5!1sgCG5OmLnEufaCHu9MyH6FA!2e0!6s'],
    [MIDDLE_OF_OCEAN.lat, MIDDLE_OF_OCEAN.lon, 'gCG5OmLnEufaCHu9MyH6FA', 'https://www.google.com/maps/@28.092432,-34.399243,3a,75y,114.29h,77.17t/data=!3m7!1e1!3m5!1sgCG5OmLnEufaCHu9MyH6FA!2e0!6s'],
    [TUNIS.lat, TUNIS.lon, 'gCG5OmLnEufaCHu9MyH6FA', 'https://www.google.com/maps/@36.8032829,10.1808486,3a,75y,114.29h,77.17t/data=!3m7!1e1!3m5!1sgCG5OmLnEufaCHu9MyH6FA!2e0!6s'],
  ])('parse the url for lat: %f, lon: %f, and id: %s', (_lat, _lon, _id, url) => {
    const [lat, lon, id] = parseURL(url)
    expect(lat).toEqual(_lat)
    expect(lon).toEqual(_lon)
    expect(id).toEqual(_id)
  })
})

describe('searchPanorama', () => {
  it.each([
    [SYDNEY, { pano_id: '1ms8oLWVvuRNHdR_1gqb5g', lat: -33.87957856442007, lon: 151.1655058795163, heading: 105.82666015625, pitch: 85.96726989746094, roll: 358.2423706054688, date: new Date('2020-08-31T23:00:00.000Z') }],
    [BELGRAVIA, { pano_id: 'sdwy_2mT-ORnoxOtctfSZw', lat: 51.49868023019671, lon: -0.1569740977100459, heading: 68.38595581054688, pitch: 89.88790130615234, roll: 359.8343200683594, date: new Date('2022-03-31T23:00:00.000Z') }],
    [MIDDLE_OF_OCEAN, []],
    [TUNIS, { pano_id: '9l8irYraTK8bcIKTEBmxTw', lat: 36.80365668749277, lon: 10.18078867631858, heading: 352.4731140136719, pitch: 90.40827178955078, roll: 0.4943621158599854, date: null }],
  ])('get the first panorama from the search', async (location, first_pano) => {
    const panos = await searchPanorama(session, location.lat, location.lon)
    const pano = panos.length > 0 ? panos[0] : panos
    expect(pano).toEqual(first_pano)
  })
})

describe('searchPanoramas', () => {
  it('get the first pano of each location', async () => {
    const locations: Location[] = [[SYDNEY.lat, SYDNEY.lon], [BELGRAVIA.lat, BELGRAVIA.lon], [MIDDLE_OF_OCEAN.lat, MIDDLE_OF_OCEAN.lon], [TUNIS.lat, TUNIS.lon]]
    const panos = await searchPanoramas(session, locations)
    const first_panos = panos.map(p => p.length > 0 ? p[0] : p)
    expect(first_panos).toEqual([
      {
        pano_id: '1ms8oLWVvuRNHdR_1gqb5g',
        lat: -33.87957856442007,
        lon: 151.1655058795163,
        heading: 105.82666015625,
        pitch: 85.96726989746094,
        roll: 358.2423706054688,
        date: new Date('2020-08-31T23:00:00.000Z'),
      },
      {
        pano_id: 'sdwy_2mT-ORnoxOtctfSZw',
        lat: 51.49868023019671,
        lon: -0.1569740977100459,
        heading: 68.38595581054688,
        pitch: 89.88790130615234,
        roll: 359.8343200683594,
        date: new Date('2022-03-31T23:00:00.000Z'),
      },
      [],
      {
        pano_id: '9l8irYraTK8bcIKTEBmxTw',
        lat: 36.80365668749277,
        lon: 10.18078867631858,
        heading: 352.4731140136719,
        pitch: 90.40827178955078,
        roll: 0.4943621158599854,
        date: null,
      },
    ])
  })
})

describe.concurrent('searchPanoramaURL', () => {
  it.each([
    [urls[0], { pano_id: '1ms8oLWVvuRNHdR_1gqb5g', lat: -33.87957856442007, lon: 151.1655058795163, heading: 105.82666015625, pitch: 85.96726989746094, roll: 358.2423706054688, date: new Date('2020-08-31T23:00:00.000Z') }],
    [urls[1], { pano_id: 'sdwy_2mT-ORnoxOtctfSZw', lat: 51.49868023019671, lon: -0.1569740977100459, heading: 68.38595581054688, pitch: 89.88790130615234, roll: 359.8343200683594, date: new Date('2022-03-31T23:00:00.000Z') }],
    [urls[2], []],
    [urls[3], { pano_id: '9l8irYraTK8bcIKTEBmxTw', lat: 36.80365668749277, lon: 10.18078867631858, heading: 352.4731140136719, pitch: 90.40827178955078, roll: 0.4943621158599854, date: null }],
  ])('get first pano of from the url', async (url, _first) => {
    const pano = await searchPanoramaURL(session, url)
    const firts = pano.length > 0 ? pano[0] : pano
    expect(firts).toEqual(_first)
  })
})

describe('searchPanoramaURLs', () => {
  it('search all panorama urls', async () => {
    const panos = await searchPanoramaURLs(session, urls)
    const firsts = panos.map(p => p.length > 0 ? p[0] : p)
    expect(firsts).toEqual([
      {
        pano_id: '1ms8oLWVvuRNHdR_1gqb5g',
        lat: -33.87957856442007,
        lon: 151.1655058795163,
        heading: 105.82666015625,
        pitch: 85.96726989746094,
        roll: 358.2423706054688,
        date: new Date('2020-08-31T23:00:00.000Z'),
      },
      {
        pano_id: 'sdwy_2mT-ORnoxOtctfSZw',
        lat: 51.49868023019671,
        lon: -0.1569740977100459,
        heading: 68.38595581054688,
        pitch: 89.88790130615234,
        roll: 359.8343200683594,
        date: new Date('2022-03-31T23:00:00.000Z'),
      },
      [],
      {
        pano_id: '9l8irYraTK8bcIKTEBmxTw',
        lat: 36.80365668749277,
        lon: 10.18078867631858,
        heading: 352.4731140136719,
        pitch: 90.40827178955078,
        roll: 0.4943621158599854,
        date: null,
      },
    ])
  })
})
