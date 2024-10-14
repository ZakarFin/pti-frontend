import './index.js';

// These framework bundles have to be imported first
import 'oskari-loader!oskari-frontend/packages/framework/bundle/mapfull/bundle.js';
import 'oskari-loader!oskari-frontend/packages/framework/bundle/oskariui/bundle.js';
import 'oskari-loader!oskari-frontend/packages/framework/bundle/divmanazer/bundle.js';

// Then import mapmodule and rest of the application
import 'oskari-loader!oskari-frontend/packages/mapping/ol/mapmodule/bundle.js';

import 'oskari-loader!oskari-frontend/packages/framework/bundle/coordinatetool/bundle.js';
import 'oskari-loader!oskari-frontend/packages/framework/layerlist/bundle.js';
import 'oskari-loader!oskari-frontend/packages/framework/bundle/findbycoordinates/bundle.js';
import 'oskari-loader!oskari-frontend/packages/framework/bundle/guidedtour/bundle.js';
import 'oskari-loader!oskari-frontend/packages/framework/bundle/maplegend/bundle.js';
import 'oskari-loader!oskari-frontend/packages/framework/bundle/postprocessor/bundle.js';
import 'oskari-loader!oskari-frontend/packages/framework/bundle/routingService/bundle.js';
import 'oskari-loader!oskari-frontend/packages/framework/bundle/statehandler/bundle.js';
import 'oskari-loader!oskari-frontend/packages/framework/bundle/search/bundle.js';
import 'oskari-loader!oskari-frontend/packages/framework/bundle/timeseries/bundle.js';
import 'oskari-loader!oskari-frontend/packages/framework/bundle/ui-components/bundle.js';

import 'oskari-loader!oskari-frontend/packages/mapping/ol/heatmap/bundle.js';
import 'oskari-loader!oskari-frontend/packages/mapping/ol/mapwmts/bundle.js';
import 'oskari-loader!oskari-frontend/packages/mapping/ol/maprotator/bundle.js';
import 'oskari-loader!oskari-frontend/packages/mapping/ol/wfsvector/bundle.js';
import 'oskari-loader!oskari-frontend/packages/mapping/ol/mapmyplaces/bundle.js';
import 'oskari-loader!oskari-frontend/packages/mapping/ol/mapuserlayers/bundle.js';
import 'oskari-loader!oskari-frontend/packages/mapping/ol/userstyle/bundle.js';
import 'oskari-loader!oskari-frontend/packages/mapping/ol/maparcgis/bundle.js';
import 'oskari-loader!oskari-frontend/packages/mapping/ol/drawtools/bundle.js';
import 'oskari-loader!oskari-frontend/packages/mapping/ol/infobox/bundle.js';
import 'oskari-loader!oskari-frontend/packages/mapping/ol/toolbar/bundle.js';


// mobile tuning
import 'oskari-lazy-loader?feedbackService!oskari-loader!oskari-frontend/packages/framework/bundle/feedbackService/bundle.js';
import 'oskari-lazy-loader?myplaces3!oskari-loader!oskari-frontend/packages/framework/bundle/myplaces3/bundle.js';
import 'oskari-lazy-loader?myplacesimport!oskari-frontend/packages/framework/bundle/myplacesimport/bundle.js';
import 'oskari-lazy-loader?mydata!oskari-frontend/bundles/framework/mydata/bundle.js';
import 'oskari-lazy-loader?publisher2!oskari-frontend/packages/framework/bundle/publisher2/bundle.js';
import 'oskari-lazy-loader?printout!oskari-frontend/packages/framework/bundle/printout/bundle.js';
import 'oskari-lazy-loader?userguide!oskari-frontend/packages/framework/bundle/userguide/bundle.js';
import 'oskari-lazy-loader?coordinatetransformation!../../packages/paikkatietoikkuna/bundle/coordinatetransformation/bundle.js';
import 'oskari-lazy-loader?statsgrid!oskari-frontend/bundles/statistics/statsgrid/bundle.js';
import 'oskari-lazy-loader?terrain-profile!oskari-frontend-contrib/packages/terrain-profile/bundle.js';
import 'oskari-lazy-loader?layerswipe!oskari-frontend/packages/mapping/ol/layerswipe/bundle.js';
import 'oskari-lazy-loader?featuredata!oskari-frontend/packages/framework/featuredata/bundle.js';
import 'oskari-lazy-loader?metadataflyout!oskari-frontend/bundles/catalogue/metadata/bundle.js'
import 'oskari-lazy-loader?metadatasearch!oskari-frontend/packages/catalogue/metadatasearch/bundle.js';
// added for mobile
import 'oskari-lazy-loader?mobileuserguide!../../bundles/paikkatietoikkuna/mobileuserguide/bundle.js';
// end mobile tuning

import 'oskari-loader!oskari-frontend/packages/mapping/dimension-change/bundle.js';

// 3D layer support
import 'oskari-loader!oskari-frontend/packages/mapping/olcs/map3dtiles/bundle.js';

// contrib
import 'oskari-loader!oskari-frontend-contrib/packages/analysis/ol/analyse/bundle.js';
import 'oskari-loader!oskari-frontend-contrib/packages/mapping/ol/mapanalysis/bundle.js';

// pti
import 'oskari-loader!../../packages/paikkatietoikkuna/bundle/register/bundle.js';
import 'oskari-loader!../../packages/paikkatietoikkuna/bundle/telemetry/bundle.js';
import 'oskari-loader!../../packages/paikkatietoikkuna/lang-overrides/bundle.js';
import 'oskari-loader!../../packages/paikkatietoikkuna/bundle/inspire/bundle.js';
import 'oskari-loader!oskari-frontend/bundles/framework/layeranalytics/bundle.js';

// lazy

import 'oskari-lazy-loader?admin-permissions!oskari-frontend/packages/admin/bundle/admin-permissions/bundle.js';
//import 'oskari-lazy-loader?admin-layerrights!oskari-frontend/packages/framework/bundle/admin-layerrights/bundle.js';
import 'oskari-lazy-loader?admin!oskari-frontend/packages/admin/bundle/admin/bundle.js';
import 'oskari-lazy-loader?metrics!oskari-frontend/packages/admin/bundle/metrics/bundle.js';
import 'oskari-lazy-loader?appsetup!oskari-frontend/packages/admin/bundle/appsetup/bundle.js';
import 'oskari-lazy-loader?admin-layereditor!oskari-frontend/packages/admin/bundle/admin-layereditor/bundle.js';
import 'oskari-lazy-loader?admin-layeranalytics!oskari-frontend/bundles/admin/admin-layeranalytics/bundle.js';

import 'oskari-lazy-loader?announcements!oskari-frontend/packages/framework/bundle/announcements/bundle.js';
import 'oskari-lazy-loader?admin-announcements!oskari-frontend/packages/admin/bundle/admin-announcements/bundle.js';
import 'oskari-lazy-loader?admin-users!oskari-frontend/packages/framework/bundle/admin-users/bundle.js';

import { PTIOrtophotoTimeseriesGFIformatter } from '../../util/PTIOrtophotoTimeseriesGFIformatter';

import './css/overwritten.css';

Oskari.on('app.start', () => {
    Oskari.getSandbox()
        .findRegisteredModuleInstance('MainMapModuleGetInfoPlugin')
        .addLayerFormatter(new PTIOrtophotoTimeseriesGFIformatter());
});
