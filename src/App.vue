<template>
  <div class="bg-grey-3 q-pa-md">
    <q-stepper v-model="step" ref="stepper" color="primary" animated>

      <q-step :name="1" title="Localisation" icon="assignment" :done="step > 1">

        <!-- 1. LOCATION -->
        <div class="q-pa-md">
          <div class="text-h5">Étape 1: Localisation du projet</div>
          <Search @addOption="addRecord"></Search>
          <Map ref="map" :geojson="geojson"></Map>
          <Table :rows="geojson.features" @action="" @deleteItem="deleteRecord" @focusItem="focusRecord"></Table>
          <div class="q-my-md">
            <q-card class="my-card text-white" style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%)">
              <q-card-section>
                <div class="text-h6">Résumé de la localisation</div>
                <div class="text-subtitle2">{{ loctype }}</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                {{ lorem }}
              </q-card-section>
            </q-card>

          </div>
        </div>

        <!-- 2. RAW PARKING NEEDS -->
        <div class="q-pa-md">
          <div class="text-h5">Étape 2: Calcul du besoin brut</div>
          <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders" v-for="(item, key) in factors">
            <label class="text-h7 ">{{ item.affectation }}</label>
            <div class="row q-col-gutter-sm">

              <div class="col">
                <q-input class="col" bg-color="white" outlined label="" type="number" name="item.affectation"
                  v-model.number="item.area" min="0.0" max="Inf">
                  <template v-slot:label>
                    Surface brute de plancher (SBP) <!-- en m<sup>2</sup> -->
                  </template>

                  <template v-slot:append>
                    <div class="text-body2">m<sup>2</sup></div>
                  </template>

                </q-input>
              </div>

              <div class="col">
                <q-input v-if="item.isHousing" class="col" bg-color="white" outlined label="Nombre de logements"
                  type="number" name="item.housing" v-model.number="item.housing" min="0.0" max="Inf">
                </q-input>
              </div>

              <div class="col">
                <q-input bg-color="light-blue-1" outlined label="Besoin brut habitant/employé" type="number"
                  name="item.rawResidentNeed" v-model.number="item.rawResidentNeed" readonly>
                </q-input>
              </div>

              <div class="col">
                <q-input class="col" bg-color="light-blue-1" outlined label="Besoin brut visiteur/client" type="number"
                  name="item.rawVisitorNeed" v-model.number="item.rawVisitorNeed" readonly>
                </q-input>
              </div>

              <div class="col">
                <q-input class="col" bg-color="light-blue-1" outlined label="Besoin brut total" type="number"
                  name="item.rawVisitorNeed" v-model.number="item.rawTotalNeed" readonly>
                </q-input>
              </div>

            </div>
          </div>


        </div>

        <!-- 3. NET PARKING NEEDS -->
        <div class="q-pa-md">
          <div class="text-h5">Étape 3: Calcul du besoin net</div>


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
import { Quasar } from "quasar";
import { ref, isProxy, toRaw, effect } from 'vue'
import GeoJSON from 'ol/format/GeoJSON.js'
import { Vector as VectorLayer } from 'ol/layer.js'

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

// Factor
class Factor {
  constructor(type, affectation, areaFactor, housingFactor, activityFactor, area, housing) {
    this.type = type
    this.affectation = affectation
    this.areaFactor = parseFloat(areaFactor)
    this.housingFactor = parseFloat(housingFactor)
    this.activityFactor = parseFloat(activityFactor)
    this.area = parseFloat(area)
    this.housing = parseFloat(housing)
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
}

const factors = []
factors.push(new Factor("Logement", "Logements standards", 0.01, 1, 0.1, 0, 0))
factors.push(new Factor("Logement", "Logements avec encadrement ou étudiants", 0.01, 1, 0.1, 0, 0))
factors.push(new Factor("Activité", "Services à nombreuse clientèle", 0.01, 2, 1, 0, 0))
factors.push(new Factor("Activité", "Magasins à nombreuse clientèle", 0.01, 2, 8, 0, 0))
factors.push(new Factor("Activité", "Autres magasins", 0.01, 1.5, 3.5, 0, 0))
factors.push(new Factor("Activité", "Industrie et artisanat", 0.01, 1, 0.2, 0, 0))
factors.push(new Factor("Activité", "Entrepôts et dépôts", 0.01, 0.1, 0.01, 0, 0))
factors.push(new Factor("Activité", "Autres services", 0.01, 2, 0.5, 0, 0))

// Project
class Project {
  constructor(parcels, factors) {
    this.parcels = parcels
    this.factors = factors
  }
  get locationType() {
    return 'IV'
  }
}

// 


export default {
  name: 'App',
  components: {
    Map,
    Table,
    Search
  },
  setup() {
    return {
      map: ref(),
      step: ref(1),
    };
  },
  data() {
    return {
      factors: factors,
      options: null,
      geojson: {
        'type': 'FeatureCollection',
        'features': []
      }
    }
  },
  computed: {
    olFeatures() {
      return new GeoJSON().readFeatures(this.geojson)
    },
    loctype() {

      if (this.geojson.features.length > 0) {

        let locations = this.geojson.features

        let sums = { 'I': 0.0, 'II': 0.0, 'III': 0.0, 'IV': 0.0, 'V': 0.0, 'VI': 0.0 }

        this.geojson.features.forEach(feature => {

          feature.properties.locations.forEach(location => {

            sums[location.type] += location.area

          })

        })

        console.log('sums all')
        console.log(sums)

        let result = this.geojson.features.map(obj => obj.properties.locations)
        console.log('result')
        console.log(result)

        // temp1[0].properties.locations.filter(el => el.type === 'V')

        return sums
      }
    },
  },
  methods: {

    addRecord(feature) {

      console.log(`App.vue | Add new record with id=${feature.id}`)

      console.log(this.geojson.features)

      // add MOB20 attribute
      let locations = []
      locations.push(new Mob20('I', 1000 * Math.random()))
      locations.push(new Mob20('II', 1000 * Math.random()))
      locations.push(new Mob20('III', 1000 * Math.random()))
      locations.push(new Mob20('IV', 1000 * Math.random()))
      locations.push(new Mob20('V', 1000 * Math.random()))
      locations.push(new Mob20('VI', 1000 * Math.random()))

      console.log(feature.properties)
      feature.properties.locations = locations

      //console.log(toRaw(feature))

      // add feature to geojson
      this.geojson.features.push(feature)


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
      // this.focus = id
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
