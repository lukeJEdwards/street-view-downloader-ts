# street-view-downloader

# Features

-  **Latitude & Longitude**: Input lat and lon to get the panorama

*coming soon*
- ~~**URL**: paste in a google maps url to get the panorama you looking at~~
- ~~**KML**: Pass the path of a kml file to get all panaorama of the coordinates in the file~~

# Usage

``` Typescript
import axios from 'axios'

import { searchPanorama, getPanorama } from 'street-view-downloader'
import type { panorama, location } from 'street-view-downloader'

const SAVE_LOCATION = './savelocation'

const session = axios.create()
const Location: location = [51.5068495, -0.0754049]

const panoramaInfo: panorama = await searchPanorama(session, ...Location)
await getPanorama(session, panoramaInfo.pano_id, SAVE_LOCATION)

```

# Install

``` bash
npm  i  street-view-downloader
```

# credit
This application start due to the need to download multiple panoramas from google street view for my artwork and the only way I could find in time for my deadline was a python package. one programme offered, on the url below allowed, for multi-panorama downloading but hid it away behind a pay wall, I respect paying for someone's hard work but at the same time being a broke student I couldn’t pay the fee. So for myself and others like me I hope this helps.

**Project idea**: https://svd360.istreetview.com/
**google-streetview 1.2.9**: https://pypi.org/project/google-streetview/

# License
[MIT](./LICENSE) License © 2023-PRESENT [Luke Edwards](https://github.com/lukeJEdwards)
