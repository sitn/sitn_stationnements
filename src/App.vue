<template>
  <div class="row justify-center no-print">
    <div class="col-xs-12 col-sm-12 col-md-9">
      <div class="bg-white q-pa-md q-ma-md">
        <!-- 1. LOCATION -->
        <div class="q-pa-md">
          <div class="text-h5">Étape 1: Localisation du projet</div>
          <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders">
            <Search @addOption="addRecord"></Search>
          </div>
          <Map ref="map" :geojson="geojson"></Map>
          <div class="q-my-md">
            <q-card class="bg-blue-grey-8 text-white">
              <q-card-section>
                <div class="text-h6">{{ numberOfparcels }} parcelle(s) sélectionnée(s)</div>
                <div class="text-subtitle2">{{ locinfo }}</div>
              </q-card-section>
            </q-card>
          </div>

          <LocationTable :rows="geojson.features" @action="" @deleteItem="deleteRecord" @focusItem="focusRecord">
          </LocationTable>

          <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders">
            <q-select outlined bottom-slots bg-color="white" v-model="project.locationType" :options="locationSums"
              option-value="name" option-label="name" @update:model-value="selectOption()"
              label="Type de localisation du projet">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.area.toFixed(0) }} m<sup>2</sup> ({{ (100 *
                      scope.opt.ratio).toFixed(1) }}%)</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:hint>
                Choisir le type de localisation
              </template>
            </q-select>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- 2. RAW PARKING NEEDS -->
  <div class="row justify-center no-print">
    <div class="col-xs-12 col-sm-12 col-md-9">
      <div class="bg-white q-pa-md q-ma-md">
        <FormB :project="project" @updateProject="updateProject"></FormB>
      </div>
    </div>
  </div>

  <!-- 3. NET PARKING NEEDS -->
  <div class="row justify-center no-print">
    <div class="col-xs-12 col-sm-12 col-md-9">
      <div class="bg-white q-pa-md q-ma-md">
        <FormC :project="project"></FormC>
      </div>
    </div>
  </div>

  <!-- 4. REDUCED NET PARKING NEEDS -->
  <div class="row justify-center no-print">
    <div class="col-xs-12 col-sm-12 col-md-9">
      <div class="bg-white q-pa-md q-ma-md">
        <FormD :project="project"></FormD>
      </div>
    </div>
  </div>

  <!-- 5. SUMMARY -->
  <div class="row justify-center">
    <div class="col-xs-12 col-sm-12 col-md-9">
      <div class="bg-white q-pa-md q-ma-md">
        <FormE :project="project"></FormE>
      </div>
    </div>
  </div>
</template>

<script>
import Search from "./components/Search.vue"
import Map from "./components/Map.vue"
import LocationTable from "./components/LocationTable.vue"
import FormB from "./components/FormB.vue"
import FormC from "./components/FormC.vue"
import FormD from "./components/FormD.vue"
import FormE from "./components/FormE.vue"
import { ref } from 'vue'
// import { Quasar } from "quasar";
// import { ref, isProxy, toRaw, effect } from 'vue'
// import GeoJSON from 'ol/format/GeoJSON.js'
// import { Vector as VectorLayer } from 'ol/layer.js'

// Classes
const colors = { 'I': 'legend-1', 'II': 'legend-2', 'III': 'legend-3', 'IV': 'legend-4', 'V': 'legend-5', 'VI': 'legend-6' }

// Mob 20
class Mob20 {
  constructor(type, area) {
    this.type = type;
    this.area = parseFloat(area);
  }
  get color() {
    return colors[this.type]
  }
}

// Location types
class LocationTypes {
  constructor(name, housingRange, activityRange) {
    // this.commune = commune
    this.name = name
    this.ranges = { housing: { min: 0.2, max: 0.5 }, activity: { min: 0.2, max: 0.5 } }
    this.housingRange = housingRange
    this.activityRange = activityRange
  }
}

const locationTypes = []
locationTypes.push(new LocationTypes("I", { min: 0.2, max: 0.5 }, { min: 0.0, max: 0.3 }))
locationTypes.push(new LocationTypes("II", { min: 0.5, max: 0.7 }, { min: 0.2, max: 0.5 }))
locationTypes.push(new LocationTypes("III", { min: 0.7, max: 1.0 }, { min: 0.4, max: 0.7 }))
locationTypes.push(new LocationTypes("IV", { min: 0.7, max: 1.0 }, { min: 0.5, max: 0.8 }))
locationTypes.push(new LocationTypes("V", { min: 0.7, max: 1.0 }, { min: 0.7, max: 1.0 }))
locationTypes.push(new LocationTypes("VI", { min: 0.7, max: 1.0 }, { min: 0.9, max: 1.0 }))

// Reduction factor
class Reduction {
  constructor(factor, description) {
    this._factor = factor
    this.description = description
  }
  get factor() {
    return this._factor * 100
  }
  set factor(val) {
    this._factor = val / 100
  }
}

// Need
class Need {
  constructor(type,) {
    this.type = type
    this.factors = factors
  }
}

// Affectation
class Affectation {
  constructor(type, name, factors, reductions, area, numberOfHouses) {
    this.type = type
    this.name = name
    this.factors = factors
    this.range = { min: 0.0, max: 1.0 }
    this.reductions = reductions
    this.area = parseFloat(area)
    this.numberOfHouses = parseFloat(numberOfHouses)
    this.active = false

  }
  get needs() {
    let obj = { resident: { raw: 0.0, net: 0.0, reduced: 0.0 }, visitor: { raw: 0.0, net: 0.0, reduced: 0.0 } }

    obj.resident.raw = parseFloat(Math.max(this.area * this.factors.area * this.factors.resident, this.numberOfHouses))
    obj.visitor.raw = parseFloat((this.area * this.factors.area * this.factors.visitor))

    obj.resident.net = { min: this.range.min * parseFloat(obj.resident.raw), max: this.range.max * parseFloat(obj.resident.raw) }
    obj.visitor.net = { min: this.range.min * parseFloat(obj.visitor.raw), max: this.range.max * parseFloat(obj.visitor.raw) }

    obj.resident.reduced = { min: (1 - this.totalReduction) * obj.resident.net.min, max: (1 - this.totalReduction) * obj.resident.net.max }
    obj.visitor.reduced = { min: (1 - this.totalReduction) * obj.visitor.net.min, max: (1 - this.totalReduction) * obj.visitor.net.max }

    return obj

  }
  get totalNeed() {
    return { min: this.needs.resident.reduced.min + this.needs.visitor.reduced.min, max: this.needs.resident.reduced.max + this.needs.visitor.reduced.max }
  }
  get totalReduction() {
    if (this.reductions.length > 0) {
      return Math.min(this.reductions.reduce((acc, obj) => { return acc + obj.factor }, 0), 100) / 100
    } else {
      return 0.0
    }
  }
  get isHousing() {
    return this.type === "Logement"
  }


  get rawResidentNeed() {
    return parseFloat(Math.max(this.area * this.factors.area * this.factors.resident, this.numberOfHouses).toFixed(2))
  }
  get rawVisitorNeed() {
    return parseFloat((this.area * this.factors.area * this.factors.visitor).toFixed(2))
  }
  get rawTotalNeed() {
    return (this.rawResidentNeed + this.rawVisitorNeed).toFixed(2)
  }
  get netResidentNeed() {
    return { min: this.range.min * parseFloat(this.rawResidentNeed), max: this.range.max * parseFloat(this.rawResidentNeed) }
  }
  get netVisitorNeed() {
    return { min: this.range.min * parseFloat(this.rawVisitorNeed), max: this.range.max * parseFloat(this.rawVisitorNeed) }
  }
  get reducedNetResidentNeed() {
    return { min: (1 - this.totalReduction) * this.netResidentNeed.min, max: (1 - this.totalReduction) * this.netResidentNeed.max }
  }
  get reducedNetVisitorNeed() {
    return { min: (1 - this.totalReduction) * this.netVisitorNeed.min, max: (1 - this.totalReduction) * this.netVisitorNeed.max }
  }

}

// Project
class Project {
  constructor(parcels, affectations) {
    this.parcels = parcels
    this.affectations = affectations
    this.housingRange = { min: 0.0, max: 1.0 }
    this.activityRange = { min: 0.0, max: 1.0 }
    this._locationType = null
  }

  get totalNeed() {
    let activeAffectations = this.affectations.filter(e => e.active)
    if (activeAffectations > 0) {
      let obj = { min: 0.0, max: 0.0 }
      obj.min = activeAffectations.reduce((acc, obj) => { return acc + obj.totalNeed.min }, 0)
      obj.max = activeAffectations.reduce((acc, obj) => { return acc + obj.totalNeed.max }, 0)
      return obj
    } else {
      return { min: 0.0, max: 0.0 }
    }
  }

  get commune() {
    return 'default'
  }

  get locationType() {
    if (this._locationType !== null) {
      return this._locationType
    } else {
      return null
    }
  }

  set locationType(location) {

    // let labels = ['I', 'II', 'III', 'IV', 'V', 'VI']
    // console.log(location)
    //if (labels.includes(location.name)) {

    if (location !== null) {

      console.log(`App.vue | Location type set to: ${location.name}`)
      this._locationType = location
      let ranges = locationTypes.find(el => el.name === location.name)

      // set project ranges
      this.housingRange = ranges.housingRange
      this.activityRange = ranges.activityRange

      // set ranges for each affectation
      this.affectations.forEach(affectation => {

        switch (affectation.type) {
          case 'Logement':
            affectation.range = ranges.housingRange
            break
          case 'Activité':
            affectation.range = ranges.activityRange
            break
        }

      })

    } else {
      this._locationType = null
    }

  }
  getAffectation(name) {
    return this.affectations.find(obj => obj.name === name)
  }

}

const project = new Project(
  [],
  [
    new Affectation("Logement", "Logements standards", { area: 0.01, resident: 1, visitor: 0.1 }, [], 0, 0),
    new Affectation("Logement", "Logements avec encadrement ou étudiants", { area: 0.01, resident: 1, visitor: 0.1 }, [], 0, 0),
    new Affectation("Activité", "Services à nombreuse clientèle", { area: 0.01, resident: 2, visitor: 1 }, [], 0, 0),
    new Affectation("Activité", "Magasins à nombreuse clientèle", { area: 0.01, resident: 2, visitor: 8 }, [], 0, 0),
    new Affectation("Activité", "Autres magasins", { area: 0.01, resident: 1.5, visitor: 3.5 }, [], 0, 0),
    new Affectation("Activité", "Industrie et artisanat", { area: 0.01, resident: 1, visitor: 0.2 }, [], 0, 0),
    new Affectation("Activité", "Entrepôts et dépôts", { area: 0.01, resident: 0.1, visitor: 0.01 }, [], 0, 0),
    new Affectation("Activité", "Autres services", { area: 0.01, resident: 2, visitor: 0.5 }, [], 0, 0)
  ]
)

project.getAffectation("Logements standards").reductions = [
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Contacter la commune ou les services compétents.`)
]

project.getAffectation("Logements avec encadrement ou étudiants").reductions = [
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer pour les logements avec encadrement ou étudiants. Contacter la commune.`),
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Contacter la commune ou les services compétents.`),
]

project.getAffectation("Autres services").reductions = [
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité.`),
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple`),
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Contacter la commune ou les services compétents.`),
]

export default {
  name: 'App',
  components: {
    Map,
    LocationTable,
    Search,
    FormB,
    FormC,
    FormD,
    FormE
  },
  setup() {
    return {
      map: ref()
    }
  },
  data() {
    return {
      project: project,
      // locationTypes: locationTypes,
      locationSums: [],
      geojson: {
        'type': 'FeatureCollection',
        'features': []
      }
    }
  },
  computed: {
    parcels() {

    },
    numberOfparcels() {
      return this.geojson.features.length
    },
    locinfo() {

      // reset sums to 0
      this.locationSums = []
      this.project.locationType = null

      if (this.geojson.features.length > 0) {

        // reset sums to 0
        this.locationSums = [
          { name: "I", area: 0.0, ratio: 0.0 },
          { name: "II", area: 0.0, ratio: 0.0 },
          { name: "III", area: 0.0, ratio: 0.0 },
          { name: "IV", area: 0.0, ratio: 0.0 },
          { name: "V", area: 0.0, ratio: 0.0 },
          { name: "VI", area: 0.0, ratio: 0.0 },
        ]

        console.log('sums all')
        console.log(this.locationSums)

        let totalArea = 0.0

        this.geojson.features.forEach(feature => {

          feature.properties.locations.forEach(location => {

            let index = this.locationSums.findIndex(item => item.name === location.type)
            this.locationSums[index].area += location.area
            // totalArea += location.area

          })

        })

        // compute total area
        this.locationSums.forEach(location => {
          totalArea += location.area
        })

        // compute relative area for each type
        this.locationSums.forEach(item => {
          item.ratio = item.area / totalArea
        })

        this.locationSums.sort((a, b) => b.area - a.area)

        this.locationSums = this.locationSums.filter(obj => obj.area > 0)

        console.log('sums all')
        console.log(this.locationSums)

        console.log(`Total area ${totalArea}`)

        return this.locationSums[0]
      }
    },
  },
  methods: {
    selectOption() {

      console.log(`App.vue | Project location type: ${this.project.locationType.name}`)


    },

    getLocationType(feature) {

      let geojson = { "type": "FeatureCollection", "features": [] }
      geojson.features.push(feature)

      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(geojson),
        redirect: 'follow'
      }

      fetch("https://sitn.ne.ch/apps/stationnement/", requestOptions)
        .then(response => response.json())
        .then(result => {

          console.log(result)
          feature.properties.locations = []
          result.features.forEach(item => {

            feature.properties.locations.push(new Mob20(item.properties.type_localisation, item.properties.intersection_area))

          })

          // add feature to geojson
          this.geojson.features.push(feature)

        })
        .catch(error => console.log('error', error));
    },
    addRecord(feature) {

      this.getLocationType(feature)

      console.log(`App.vue | Add new record with id=${feature.id}`)
      console.log(`App.vue | Project location type: ${this.project.locationType}`)

    },

    deleteRecord(id) {

      this.geojson.features = this.geojson.features.filter(function (feature) {
        return feature.id !== id
      })

      console.log(`App.vue | Delete item with id=${id}`)
      console.log(`App.vue | Project location type: ${this.project.locationType}`)
      console.log(this.project.locationType)

    },
    focusRecord(id) {
      console.log(`App.vue | Focus on item with id=${id}`)
      this.map.zoomTo(id)
    },
    updateProject(obj) {

      this.project = obj

      console.log('Update project:')
      console.log(this.project)

    },

  }

}
</script>

<style>
@import './assets/main.css';
@import './assets/print.css';
@import 'https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons';
@import './assets/quasar.prod.css';
</style>