import 'oskari-loader!../../packages/paikkatietoikkuna/lang-overrides/bundle.js';

import 'oskari-bundle!oskari-frontend/bundles/framework/mapfull';
import 'oskari-loader!oskari-frontend/packages/framework/bundle/oskariui/bundle.js';
import 'oskari-loader!oskari-frontend/packages/framework/bundle/ui-components/bundle.js';
import 'oskari-loader!oskari-frontend/packages/framework/bundle/divmanazer/bundle.js';

import 'oskari-loader!oskari-frontend/packages/mapping/ol/mapmodule/bundle.js';
import 'oskari-loader!oskari-frontend/packages/mapping/ol/mapwmts/bundle.js';
import 'oskari-loader!oskari-frontend/packages/mapping/ol/wfsvector/bundle.js';
import 'oskari-loader!oskari-frontend/packages/mapping/ol/maparcgis/bundle.js';
import 'oskari-loader!oskari-frontend/packages/mapping/ol/mapuserlayers/bundle.js';

import 'oskari-loader!oskari-frontend/packages/mapping/ol/infobox/bundle.js';
import 'oskari-loader!oskari-frontend/packages/mapping/ol/drawtools/bundle.js';
import 'oskari-loader!oskari-frontend/packages/mapping/ol/toolbar/bundle.js';

import 'oskari-bundle!oskari-frontend/bundles/framework/publishedstatehandler';

import 'oskari-bundle!oskari-frontend/bundles/framework/coordinatetool';
import 'oskari-loader!oskari-frontend/packages/mapping/ol/maprotator/bundle.js';

import 'oskari-bundle!oskari-frontend/bundles/framework/postprocessor';
import 'oskari-loader!oskari-frontend/packages/framework/bundle/rpc/bundle.js';

import 'oskari-lazy-bundle?timeseries!oskari-frontend/bundles/framework/timeseries';
import 'oskari-lazy-bundle?maplegend!oskari-frontend/bundles/framework/maplegend';
import 'oskari-lazy-bundle?featuredata!oskari-frontend/bundles/framework/featuredata';
import 'oskari-lazy-bundle?routingService!oskari-frontend/bundles/framework/routingService';
import 'oskari-lazy-bundle?feedbackService!oskari-frontend/bundles/framework/feedbackService';
import 'oskari-lazy-bundle?statsgrid!oskari-frontend/bundles/statistics/statsgrid';

import 'oskari-lazy-bundle?metadataflyout!oskari-frontend/bundles/catalogue/metadataflyout'
import 'oskari-lazy-bundle?metadatasearch!oskari-frontend/bundles/catalogue/metadatasearch';

import 'oskari-lazy-loader?layerswipe!oskari-frontend/packages/mapping/ol/layerswipe/bundle.js';
import 'oskari-lazy-bundle?announcements!oskari-frontend/bundles/framework/announcements';

import { PTIOrtophotoTimeseriesGFIformatter } from '../../util/PTIOrtophotoTimeseriesGFIformatter';

import './css/overwritten.css';

Oskari.on('app.start', () => {
    var plugin = Oskari.getSandbox().findRegisteredModuleInstance('MainMapModuleGetInfoPlugin');
    if (plugin) {
        // not all embedded maps have the plugin
        plugin.addLayerFormatter(new PTIOrtophotoTimeseriesGFIformatter());
    }
});