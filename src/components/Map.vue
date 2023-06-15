<template>
    <div class="q-py-md" style="width:100%;height:400px;">
        <div id="map"></div>
    </div>
</template>

<script>
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorSource from 'ol/source/Vector.js';
import { Image as ImageLayer, Vector as VectorLayer } from 'ol/layer.js';
// import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer.js';
import Projection from 'ol/proj/Projection';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { getTopLeft, getWidth } from 'ol/extent.js';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import { ref, isProxy, toRaw } from 'vue'

// CRS definitions
proj4.defs(
    "EPSG:2056",
    "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs"
);

register(proj4);

const extent = [2420000, 976000.0000000001, 2932000, 1360000];
const projection = new Projection({
    code: 'EPSG:2056',
    extent: extent,
});
//const projection = getProjection('EPSG:2056');
const projectionExtent = projection.getExtent();

const resolutions = [
    249.99999999999994,
    99.99999999999999,
    49.99999999999999,
    19.999999999999996,
    9.999999999999998,
    4.999999999999999,
    2.4999999999999996,
    1.9999999999999996,
    1.4999999999999998,
    0.9999999999999998,
    0.4999999999999999,
    0.24999999999999994,
    0.12499999999999997,
    0.062499999999999986,
    0.031249999999999993,
    0.015624999999999997,
    0.007812499999999998
]

var matrixIds = [];
for (var i = 0; i < resolutions.length; i++) {
    matrixIds.push(i);
}

export default {
    name: 'Map',
    components: {},
    props: ['geojson'],
    emits: [],
    expose: ['zoomTo'],
    data() {
        return {
            features: [],
            vectorLayer: null,
            vectorSource: null,
        }
    },
    computed: {
        olFeatures() {

            return new GeoJSON().readFeatures(this.geojson);

        },
        olVectorSource() {
            return new VectorSource({
                features: this.olFeatures,
            });
        },
        olVectorLayer() {
            // this.olVectorSource.refresh({ force: true })
            return new VectorLayer({
                source: this.olVectorSource,
            });
        },

        featuresCount() {
            console.log(`Feature count: ${this.olFeatures.length}`)
            return this.olFeatures.length
        }

    },
    methods: {
        zoomTo(id) {

            console.log(`Map.vue | Focus on item with id=${id}`)
            const view = this.olMap.getView()
            const source = this.vectorLayer.getSource()
            const features = toRaw(source.getFeatures())

            let target = features.find((f) => {
                return f.getId() === id
            })

            view.fit(target.getGeometry(), {
                //padding: [170, 50, 30, 150],
                maxZoom: 12,
                size: [200, 200]
            })

        },
        updateSource() {
            // this.olVectorLayer.changed()
            // this.olVectorSource.refresh({ force: true })

            const view = this.olMap.getView()
            const source = this.vectorLayer.getSource()

            // source.changed()
            console.log('updateSource')
            console.log(source)
            console.log(source.getFeatures());

            // console.log(`Number of features: ${source.getFeatures().length}`)

            source.clear();

            if (this.featuresCount > 0) {
                source.addFeatures(this.olFeatures);
                view.fit(source.getExtent())
            }

        }
    },
    mounted() {

        console.log(`Count: ${this.featuresCount}`)

        const vectorSource = new VectorSource({
            features: this.olfeatures,
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource,
        });

        this.vectorLayer = new VectorLayer({
            source: new VectorSource({
                features: [],
            }),
        })

        // Map
        this.olMap = new Map({
            target: 'map',
            layers: [
                new TileLayer({
                    opacity: 1.0,
                    source: new WMTS({
                        attributions:
                            'Tiles © <a href="https://sitn.ne.ch/"' +
                            ' target="_blank">SITN</a>',
                        url: 'https://sitn.ne.ch/mapproxy95/service?',
                        layer: 'plan_ville',
                        matrixSet: 'EPSG2056',
                        format: 'image/png',
                        projection: projection,
                        tileGrid: new WMTSTileGrid({
                            origin: getTopLeft(projectionExtent),
                            resolutions: resolutions,
                            matrixIds: matrixIds,
                        }),
                        style: 'default',
                        wrapX: false,
                    }),
                }),
                new ImageLayer({
                    source: new ImageWMS({
                        attributions:
                            'Tiles © <a href="https://sitn.ne.ch/"' +
                            ' target="_blank">SITN</a>',
                        crossOrigin: 'anonymous',
                        params: {
                            'ogcserver': 'private-png',
                            'SERVICE': 'WMS',
                            'VERSION': '1.3.0',
                            'REQUEST': 'GetMap',
                            'FORMAT': 'image/png',
                            'TRANSPARENT': true,
                            'LAYERS': 'mob20_type_localisation'
                        },
                        serverType: 'mapserver',
                        url: 'https://sitn.ne.ch/services/wms',
                    }),
                }),
                this.vectorLayer,
            ],
            view: new View({
                center: [2550720, 1196243],
                zoom: 4,
                projection: projection,
            }),
        })

        this.updateSource()

    },
    watch: {

        featuresCount(v) {
            this.updateSource()
            // this.olfeatures.changed()
            console.log("Map.vue | featuresCount changed")

        },
    }
}

</script>

<style>
/* @import './../../node_modules/ol/ol.css'; */
@import '../assets/ol.css';

#map {
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    position: relative;
}
</style>