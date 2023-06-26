<template>
  <div class="bg-grey-3 q-pa-md">
    <q-stepper v-model="step" ref="stepper" color="primary" animated>

      <q-step :name="1" title="Localisation" icon="assignment" :done="step > 1">

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
                <!--Résumé de la localisation-->
                <div class="text-subtitle2">{{ locinfo }}</div>
              </q-card-section>
            </q-card>
          </div>
          <Table :rows="geojson.features" @action="" @deleteItem="deleteRecord" @focusItem="focusRecord"></Table>
          <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders">
            <q-select outlined bottom-slots bg-color="white" v-model="project.locationType" :options="locationSums"
              option-value="name" option-label="name" @update:model-value="selectOption()"
              label="Type de localisation du projet">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.area.toFixed(0) }} m<sup>2</sup> ({{ (100 *
                      scope.opt.ratio).toFixed(0) }}%)</q-item-label>
                  </q-item-section>
                </q-item>
              </template>

              <template v-slot:hint>
                Choisir le type de localisation
              </template>

            </q-select>

          </div>

        </div>

        <!-- 2. RAW PARKING NEEDS -->
        <FormB :project="project" @updateProject="updateProject"></FormB>

        <!-- 3. NET PARKING NEEDS -->
        <FormC :project="project"></FormC>

        <!-- 4. REDUCED NET PARKING NEEDS -->
        <FormD :project="project"></FormD>

        <!-- 5. SUMMARY -->
        <div class="q-pa-md">
          <div class="text-h5">Étape 5: Résumé</div>
        </div>

      </q-step>


      <!-- DETAILS FORM -->
      <q-step :name="2" title="Détails" caption="" icon="assignment" :done="step > 2">
        <div class="text-h5">Détails du projet</div>
      </q-step>
      <q-step :name="3" title="Besoin brut" caption="Norme VSS" icon="assignment" disable>
        <div class="text-h5">Étape 1 : définition du besoin brut</div>
      </q-step>

      <q-step :name="4" title="Besoin net" caption="Types de localisation" icon="assignment">
        <div class="text-h5">
          Étape 2 : définition du besoin net
        </div>
      </q-step>

      <q-step :name="5" title="Besoin net réduit" caption="Facteurs de réduction" icon="assignment">
        <div class="q-gutter-md">
          <div class="text-h5">
            Étape 3 : définition du besoin net réduit
          </div>
          <p>Des facteurs de réduction peuvent être appliqués au besoin net,
            par le réquérant ou par la commune (articles 31 à 34 du
            RELConstr.). Les facteurs de réduction sont à porter en déduction
            du besoin net. Le résultat obtenu se nomme le besoin net réduit.
            Les facteurs de réduction peuvent intervenir lors de l'examen du
            dossier par la commune ou les services compétents, notamment en ce
            qui concerne la législation sur l'environnement et la sauvegarde
            du patrimoine. Pour les logements avec encadrements ou étudiants,
            il convient de prendre contact en amont avec la commune pour
            déterminer si un facteur de réduction s'applique.</p>

          <q-input outlined v-model.number="text" label="Facteur de réduction"
            hint="Facteur de réduction éventuel, si non pertinent indiquer 0 [%]"></q-input>
          <q-input outlined v-model.number="text" label="Facteur de réduction"
            hint="Facteur de réduction éventuel, si non pertinent indiquer 0 [%]"></q-input>
        </div>
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation>
          <q-btn @click="$refs.stepper.next()" color="primary" :label="step === 5 ? 'Terminer' : 'Suivant'"></q-btn>
          <q-btn v-if="step > 1" flat color="primary" @click="$refs.stepper.previous()" label="Retour"
            class="q-ml-sm"></q-btn>
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </div>
  <!-- </div> -->
</template>

<script>
import Search from "./components/Search.vue"
import Map from "./components/Map.vue"
import Table from "./components/Table.vue"
import FormB from "./components/FormB.vue"
import FormC from "./components/FormC.vue"
import FormD from "./components/FormD.vue"
import { Quasar } from "quasar";
import { ref, isProxy, toRaw, effect } from 'vue'
import GeoJSON from 'ol/format/GeoJSON.js'
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
  constructor(name, color, housingRange, activityRange) {
    // this.commune = commune
    this.name = name
    this.color = color
    this.housingRange = housingRange
    this.activityRange = activityRange
  }
}

const locationTypes = []
locationTypes.push(new LocationTypes("I", 'legend-1', { min: 0.2, max: 0.5 }, { min: 0.0, max: 0.3 }))
locationTypes.push(new LocationTypes("II", 'legend-2', { min: 0.5, max: 0.7 }, { min: 0.2, max: 0.5 }))
locationTypes.push(new LocationTypes("III", 'legend-3', { min: 0.7, max: 1.0 }, { min: 0.4, max: 0.7 }))
locationTypes.push(new LocationTypes("IV", 'legend-4', { min: 0.7, max: 1.0 }, { min: 0.5, max: 0.8 }))
locationTypes.push(new LocationTypes("V", 'legend-5', { min: 0.7, max: 1.0 }, { min: 0.7, max: 1.0 }))
locationTypes.push(new LocationTypes("VI", 'legend-6', { min: 0.7, max: 1.0 }, { min: 0.9, max: 1.0 }))

// Affectation
class Affectation {
  constructor(type, name, areaFactor, residentFactor, visitorFactor, area, housing) {
    this.type = type
    this.name = name
    this.areaFactor = parseFloat(areaFactor)
    this.housingFactor = parseFloat(residentFactor)
    this.activityFactor = parseFloat(visitorFactor)
    this.range = { min: 0.0, max: 1.0 }
    // this.housingRange = { min: 0.0, max: 1.0 } // super(housingRange)
    // this.activityRange = { min: 0.0, max: 1.0 } // super(activityRange)
    this.reductions = {}
    this.area = parseFloat(area)
    this.housing = parseFloat(housing)
    this.active = false
  }
  get isHousing() {
    return this.type === "Logement"
  }
  get rawResidentNeed() {
    return parseFloat(Math.max(this.area * this.areaFactor * this.housingFactor, this.housing).toFixed(2))
  }
  get rawVisitorNeed() {
    return parseFloat((this.area * this.areaFactor * this.activityFactor).toFixed(2))
  }
  get rawTotalNeed() {
    return (this.rawResidentNeed + this.rawVisitorNeed).toFixed(2)
  }
  get netResidentNeed() {
    // return { min: this.housingRange.min * parseFloat(this.rawResidentNeed), max: this.housingRange.max * parseFloat(this.rawResidentNeed) }
    return { min: this.range.min * parseFloat(this.rawResidentNeed), max: this.range.max * parseFloat(this.rawResidentNeed) }
  }
  get netVisitorNeed() {
    // return { min: this.activityRange.min * parseFloat(this.rawVisitorNeed), max: this.activityRange.max * parseFloat(this.rawVisitorNeed) }
    return { min: this.range.min * parseFloat(this.rawVisitorNeed), max: this.range.max * parseFloat(this.rawVisitorNeed) }
  }
}

const affectations = []
affectations.push(new Affectation("Logement", "Logements standards", 0.01, 1, 0.1, 0, 0))
affectations.push(new Affectation("Logement", "Logements avec encadrement ou étudiants", 0.01, 1, 0.1, 0, 0))
affectations.push(new Affectation("Activité", "Services à nombreuse clientèle", 0.01, 2, 1, 0, 0))
affectations.push(new Affectation("Activité", "Magasins à nombreuse clientèle", 0.01, 2, 8, 0, 0))
affectations.push(new Affectation("Activité", "Autres magasins", 0.01, 1.5, 3.5, 0, 0))
affectations.push(new Affectation("Activité", "Industrie et artisanat", 0.01, 1, 0.2, 0, 0))
affectations.push(new Affectation("Activité", "Entrepôts et dépôts", 0.01, 0.1, 0.01, 0, 0))
affectations.push(new Affectation("Activité", "Autres services", 0.01, 2, 0.5, 0, 0))

// Project
class Project {
  constructor(parcels, affectations) {
    this.parcels = parcels
    this.affectations = affectations
    this.housingRange = { min: 0.0, max: 1.0 }
    this.activityRange = { min: 0.0, max: 1.0 }
    this._locationType = null
  }
  /*
  static get labels() {
    return ['I', 'II', 'III', 'IV', 'V', 'VI']
  }
  */
  get commune() {
    return 'default'
  }

  /*
  get housingRange() {
    if (this.locationType !== null) {

      let val = locationTypes.find(el => el.name === this.locationType)
      console.log('housing range is:')
      console.log(val.housingRange)

      return val.housingRange

    } else {
      return { min: 0.0, max: 1.0 }
    }
  }
  */


  /*
  get locationType() {
    return 'II'
  }
  */
  /*
  get reductionFactors() {
    return locationTypes.filter(obj => obj.name === this.locationType && obj.commune === this.commune)
  }
  */

  get locationType() {
    if (this._locationType !== null) {
      return this._locationType
    } else {
      return null
    }
  }

  set locationType(location) {

    let labels = ['I', 'II', 'III', 'IV', 'V', 'VI']

    console.log(location)

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

        // affectation.housingRange = ranges.housingRange
        // affectation.activityRange = ranges.activityRange

      })

      // console.log('adjusting location ranges')
      // console.log(ranges)

    } else {
      this._locationType = null
    }

  }

}

const project = new Project(null, affectations)

export default {
  name: 'App',
  components: {
    Map,
    Table,
    Search,
    FormB,
    FormC,
    FormD
  },
  setup() {
    return {
      map: ref(),
      step: ref(1),
    };
  },
  data() {
    return {
      project: project,
      affectations: affectations,
      locationTypes: locationTypes,
      locationSums: [],
      options: null,
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
          totalArea += location.area;
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

        let result = this.geojson.features.map(obj => obj.properties.locations)
        console.log('result')
        console.log(result)

        return this.locationSums[0]
      }
    },
  },
  methods: {
    selectOption() {

      console.log('Project location type:')
      console.log(this.project)

      // this.updateProject()

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

            // console.log(`type ${item.properties.type_localisation}`)
            feature.properties.locations.push(new Mob20(item.properties.type_localisation, item.properties.intersection_area))

          })

          // add feature to geojson
          this.geojson.features.push(feature)
          console.log('geojson')
          console.log(this.geojson)

        })
        .catch(error => console.log('error', error));
    },
    addRecord(feature) {

      console.log(`App.vue | Add new record with id=${feature.id}`)
      // console.log(feature)
      // console.log(this.geojson.features)

      this.getLocationType(feature)

      // add MOB20 attribute
      /*
      let locations = []
      locations.push(new Mob20('I', 1000 * Math.random()))
      locations.push(new Mob20('II', 1000 * Math.random()))
      locations.push(new Mob20('III', 1000 * Math.random()))
      locations.push(new Mob20('IV', 1000 * Math.random()))
      locations.push(new Mob20('V', 1000 * Math.random()))
      locations.push(new Mob20('VI', 1000 * Math.random()))
      feature.properties.locations = locations
      */

      /*
      console.log('feature.properties')
      console.log(feature.properties)
      */

      //console.log(toRaw(feature))

    },

    deleteRecord(id) {
      console.log(`App.vue | Delete item with id=${id}`)
      this.geojson.features = this.geojson.features.filter(function (obj) {
        return obj.id !== id
      })
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
    action(id, name) {
      // console.log(`App.vue | Focus record with id=${id}`)

    },

  }

};
</script>

<style>
@import './assets/main.css';
@import "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons";
@import './assets/quasar.prod.css';
</style>