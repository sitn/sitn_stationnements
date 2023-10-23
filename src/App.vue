<template>
  <!-- HEADER -->
  <q-layout view="hHh lpR fFf" class="shadow-2 rounded-borders">
    <q-header>
      <q-toolbar class="bg-white text-black">

        <q-toolbar-title class="text-center">CALCUL DU NOMBRE DE PLACES DE STATIONNEMENT VOITURE</q-toolbar-title>

        <a href="https://www.ne.ch/autorites/DDTE/SCAT/Pages/accueil.aspx" target="_blank"><img src="./assets/img/logo_right.svg" alt="Neuchâtel" /></a>

      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-px-none q-pb-xs">
        <!-- 1. LOCATION -->
        <FormSection title="1. Localisation du projet">
          <template v-slot:content>
            <!-- 1. LOCATION -->
            <div class="q-pa-md">

              <q-form ref="form" greedy>

                <!-- N° SATAC -->
                <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders">
                  <q-input class="col" bg-color="white" outlined label="N° SATAC du projet (si disponible)" type="text" name="project.satac" v-model="project.satac" :rules="[(val) => validateSatac(val) || 'Seuls les chiffres sans espaces sont admis']">
                    <template v-slot:hint>
                      Entrer le n° SATAC avec des chiffres seulement et sans espaces
                    </template>
                  </q-input>
                </div>

                <!-- COMMUNE -->
                <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders">
                  <q-select outlined bottom-slots bg-color="white" v-model="project.commune" :options="communes" option-value="comnom" option-label="comnom" @update:model-value="resetParcels()" label="Commune" :rules="[(val) => val !== null || 'Veuillez choisir la commune']">

                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label>{{ scope.opt.comnom }}</q-item-label>
                          <!-- <q-item-label caption>n° {{ scope.opt.numcom }}</q-item-label> -->
                        </q-item-section>
                      </q-item>
                    </template>

                    <template v-slot:hint>
                      Choisir la commune
                    </template>
                  </q-select>
                </div>

                <!-- PARCEL SEARCH -->
                <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders">
                  <Search :geojson="geojson" :project="project" @addOption="addRecord"></Search>
                </div>

                <!-- PARCEL MAP -->
                <Map ref="map" :geojson="geojson"></Map>
                <div class="q-my-md">
                  <q-card class="bg-blue-grey-8 text-white">
                    <q-card-section>
                      <div class="text-h6">{{ this.geojson.features.length }} parcelle(s) sélectionnée(s)</div>
                      <!-- <div class="text-subtitle2">{{ locinfo }}</div> -->
                    </q-card-section>
                  </q-card>
                </div>

                <!-- PARCEL TABLE -->
                <LocationTable :rows="geojson.features" @deleteItem="deleteRecord" @focusItem="focusRecord">
                </LocationTable>

                <!-- LOCATION TYPE -->
                <div class="bg-grey-2 q-pa-md q-my-md rounded-borders">

                  <q-select outlined bottom-slots bg-color="white" v-model="project.locationType" :options="project.loctypes.filter(e => e.active)" option-value="name" option-label="name" @update:model-value="" label="Type de localisation du projet" :rules="[validateLocalisation]">

                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label>{{ scope.opt.name }}</q-item-label>
                          <q-item-label caption>{{ scope.opt.area.toFixed(1) }} m<sup>2</sup> ({{ (100 *
                            scope.opt.ratio).toFixed(1) }}%)</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>

                    <template v-slot:hint>
                      Choisir le type de localisation
                    </template>
                  </q-select>

                </div>

                <!-- LOCATION TYPE INFOBOX  -->
                <q-card v-if="this.project.loctypes.filter(e => e.active).length > 1" flat class="bg-grey-1 q-pa-md q-my-md infobox">

                  <q-card-section horizontal>

                    <q-card-section class="q-pa-xs">
                      <div class="text-body2 text-weight-bold q-mb-sm">Justification du type de localisation</div>


                      <div class="text-body2">
                        <ul>
                          <li> La ou les parcelle(s) se trouve(nt) sur plusieurs types de localisation. Un seul type de
                            localisation doit être choisi. Il faut brièvement justifier le choix dans le champ ci-dessous.
                          </li>

                          <li> Le choix d’un type de localisation peut notamment être justifié par le fait qu’il recouvre
                            la majorité de la ou des parcelle(s) concernée(s) ; qu’il recouvre le bâtiment ou
                            l’emplacement de l’entrée principale du bâtiment.
                          </li>
                        </ul>

                      </div>
                    </q-card-section>

                  </q-card-section>

                </q-card>

                <!-- LOCATION TYPE JUSTIFICATION  -->
                <div v-if="this.project.loctypes.filter(e => e.active).length > 1" class="bg-grey-2 q-pa-md q-my-sm rounded-borders">
                  <q-input v-model="project.locationTypeJustification" outlined bg-color="white" type="textarea" maxlength="500" counter label="Justification du type de localisation du projet" :rules="[(val) => val.length > 3 || 'Veuillez justifier le choix du type de localisation']" />
                </div>

              </q-form>

            </div>

          </template>
        </FormSection>

        <!-- 2. RAW PARKING NEEDS -->
        <FormSection title="2. Calcul du besoin brut (article 27 RELConstr.)">
          <template v-slot:content>
            <FormB :project="project" @updateProject="updateProject"></FormB>
          </template>
        </FormSection>

        <!-- 3. NET PARKING NEEDS -->
        <FormSection title="3. Calcul du besoin net (article 28 RELConstr.)">
          <template v-slot:content>
            <FormC :project="project"></FormC>
          </template>
        </FormSection>

        <!-- 4. REDUCED NET PARKING NEEDS -->
        <FormSection title="4. Calcul du besoin net réduit (article 29 RELConstr.)">
          <template v-slot:content>
            <FormD :project="project"></FormD>
          </template>
        </FormSection>

        <!-- 5. SUMMARY -->
        <FormSection title="5. Nombre de places de stationnement à réaliser (article 30 RELConstr.)">
          <template v-slot:content>
            <FormE :project="project"></FormE>
          </template>
        </FormSection>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import communes from './assets/data/communes.json'
import { Project, LocationTypes, Mob20, affectations } from "./helpers/classes.js"
import FormSection from "./components/FormSection.vue"
import Search from "./components/Search.vue"
import Map from "./components/Map.vue"
import LocationTable from "./components/LocationTable.vue"
import FormA from "./views/FormA.vue"
import FormB from "./views/FormB.vue"
import FormC from "./views/FormC.vue"
import FormD from "./views/FormD.vue"
import FormE from "./views/FormE.vue"
import { ref } from 'vue'

const project = new Project(
  [],
  affectations,
  [
    new LocationTypes("I", { housing: { min: 0.2, max: 0.5 }, activity: { min: 0.0, max: 0.4 } }),
    new LocationTypes("II", { housing: { min: 0.5, max: 0.7 }, activity: { min: 0.2, max: 0.5 } }),
    new LocationTypes("III", { housing: { min: 0.7, max: 1.0 }, activity: { min: 0.4, max: 0.7 } }),
    new LocationTypes("IV", { housing: { min: 0.7, max: 1.0 }, activity: { min: 0.5, max: 0.8 } }),
    new LocationTypes("V", { housing: { min: 0.7, max: 1.0 }, activity: { min: 0.7, max: 1.0 } }),
    new LocationTypes("VI", { housing: { min: 0.7, max: 1.0 }, activity: { min: 0.9, max: 1.0 } })
  ]
)

export default {
  name: 'App',
  components: {
    FormSection,
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
      isfilled: { 'A': false, 'B': false, 'C': false, 'D': false, 'E': false },
      communes: communes,
      project: project,
      geojson: {
        'type': 'FeatureCollection',
        'features': []
      }
    }
  },
  mounted() {
    this.$nextTick(() => { this.$refs.form.validate() })
  },
  computed: {
    count() {
      return this.geojson.features.length
    }
  },
  watch: {
    count() {

      // reset areas to 0
      this.project.locationType = null
      this.project.loctypes.forEach(location => {
        location.area = 0.0
        location.ratio = 0.0
      })

      let totalArea = 0.0

      if (this.geojson.features.length > 0) {

        this.geojson.features.forEach(feature => {
          feature.properties.locations.forEach(location => {
            let index = this.project.loctypes.findIndex(item => item.name === location.type)
            this.project.loctypes[index].area += location.area
            totalArea += location.area
          })
        })

        // compute relative area for each type
        this.project.loctypes.forEach(item => {
          item.ratio = item.area / totalArea
        })

        // if there is only one location type, select it by default
        console.log(this.project.loctypes.find(e => e.active))
        if (this.project.loctypes.filter(e => e.active).length === 1) {
          this.project.locationType = this.project.loctypes.find(e => e.active)
        }

        this.project.loctypes.sort((a, b) => b.area - a.area)
        this.$nextTick(() => { this.$refs.form.validate() })

      }

    }
  },
  methods: {
    validateLocalisation(val) {
      if (val === null) {
        return 'Veuillez indiquer un type de localisation'
      }
    },
    validateSatac(str) {
      return new RegExp('^[0-9]+$').test(str) || str.length === 0
    },
    resetParcels() {
      this.project.parcels = []
      this.geojson.features = []
    },
    addRecord(feature) {
      var myHeaders = new Headers()
      myHeaders.append("Content-Type", "application/json")

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({ "type": "FeatureCollection", "features": [feature] }),
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

          // update parcels in project
          this.project.parcels = this.geojson.features.map(x => (`n° ${x.properties.idmai.split("_")[1]}, cadastre de ${x.properties.cadnom}`))
        })
        .catch(error => console.log('error', error))

      // console.log(`App.vue | Add new record with id=${feature.id}`)
      // console.log(`App.vue | Project location type: ${this.project.locationType}`)
    },
    deleteRecord(id) {
      this.geojson.features = this.geojson.features.filter(function (feature) {
        return feature.id !== id
      })
      // update parcels in project
      this.project.parcels = this.geojson.features.map(x => x.properties.idmai)

      // console.log(`App.vue | Delete item with id=${id}`)
      // console.log(`App.vue | Project location type: ${this.project.locationType}`)
      // console.log(this.project.locationType)
      // console.log(this.project.loctypes)
    },
    focusRecord(id) {
      // console.log(`App.vue | Focus on item with id=${id}`)
      this.map.zoomTo(id)
    },
    updateProject(obj) {
      this.project = obj
      this.$nextTick(() => { this.$refs.form.validate() })
      // console.log('App.vue: updateProject')
      // console.log(this.project)
    },
  }
}
</script>

<style>
@import './assets/styles/main.css';
@import './assets/styles/print.css';
@import './assets/styles/quasar.prod.css';
</style>