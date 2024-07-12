# street-view-downloader

# Features

-  **Latitude & Longitude**: Input lat and lon to get the panorama
-  **URL**: paste in a google maps url to get the panorama you looking at

*coming soon*
- ~~**KML**: Pass the path of a kml file to get all panaorama of the coordinates in the file~~

# Usage

``` Typescript
import axios from 'axios'

import { searchPanorama, getPanorama } from 'street-view-downloader'
import type { Location } from 'street-view-downloader'

const session = axios.create()
const Location: Location = [51.5068495, -0.0754049]

const panoramaInfo  = await searchPanorama(session, ...Location)
const buffer = await getPanorama(session, panoramaInfo.pano_id)

```

# Install

``` bash
npm  i  street-view-downloader
```

# credit
This application start due to the need to download multiple panoramas from google street view for my artwork and the only way I could find in time for my deadline was a python package. one programme offered, on the url below allowed, for multi-panorama downloading but hid it away behind a pay wall, I respect paying for someone's hard work but at the same time being a broke student I couldn’t pay the fee. So for myself and others like me I hope this helps.

**Project idea**: https://svd360.istreetview.com/

**streetview 0.0.10** https://pypi.org/project/streetview/

# License
[MIT](./LICENSE) License © 2023-PRESENT [Luke Edwards](https://github.com/lukeJEdwards)
