<template>
  <div class="row justify-center no-print">
    <div class="col-xs-12 col-sm-12 col-md-9">
      <div class="bg-white q-pa-md q-ma-md">
        <!-- 1. LOCATION -->
        <div class="q-pa-md">
          <div class="text-h4 q-py-lg">CALCUL DU NOMBRE DE PLACES DE STATIONNEMENT VOITURE</div>
          <div class="text-h5">1. Localisation du projet</div>

          <!-- N° SATAC -->
          <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders">
            <q-input class="col" bg-color="white" outlined label="N° SATAC du projet (si disponible)" type="text"
              name="project.satac" v-model="project.satac"
              :rules="[(val) => validateSatac(val) || 'Seuls les chiffres sans espaces sont admis']">
              <template v-slot:hint>
                Entrer le n° SATAC avec des chiffres seulement et sans espaces
              </template>
            </q-input>
          </div>

          <!-- COMMUNE -->
          <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders">
            <q-select outlined bottom-slots bg-color="white" v-model="project.commune" :options="communes"
              option-value="comnom" option-label="comnom" @update:model-value="resetParcels()" label="Commune"
              :rules="[]">

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
          <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders">

            <q-select outlined bottom-slots bg-color="white" v-model="project.locationType"
              :options="project.loctypes.filter(e => e.active)" option-value="name" option-label="name"
              @update:model-value="selectOption()" label="Type de localisation du projet" :rules="[validateLocalisation]">

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

            La ou les parcelles se trouvent sur plusieurs types de localisation. Le choix du type de localisation à
            considérer doit être justifié dans le champs ci-dessous. La justification peut être faite par rapport à la
            surface de la parcelle concernée par les types de localisation (prise en compte du type de localisation dont
            la surface recoupe en majorité celle de la parcelle) ou par la localisation du projet sur la parcelle
            (emplacement du bâtiment, de l’entrée) en fonction du ou des arrêts de transports publics.

            <div>
              <q-input v-model="text" outlined bg-color="white" type="textarea"
                label="Justification du type de localisation du projet" />
            </div>

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
import { Project, Affectation, Reduction, LocationTypes, Need, Mob20, communes } from "./components/classes.js"
import Search from "./components/Search.vue"
import Map from "./components/Map.vue"
import LocationTable from "./components/LocationTable.vue"
import FormB from "./components/FormB.vue"
import FormC from "./components/FormC.vue"
import FormD from "./components/FormD.vue"
import FormE from "./components/FormE.vue"
import { ref } from 'vue'

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
  ],
  [
    new LocationTypes("I", { housing: { min: 0.2, max: 0.5 }, activity: { min: 0.0, max: 0.3 } }),
    new LocationTypes("II", { housing: { min: 0.5, max: 0.7 }, activity: { min: 0.2, max: 0.5 } }),
    new LocationTypes("III", { housing: { min: 0.7, max: 1.0 }, activity: { min: 0.4, max: 0.7 } }),
    new LocationTypes("IV", { housing: { min: 0.7, max: 1.0 }, activity: { min: 0.5, max: 0.8 } }),
    new LocationTypes("V", { housing: { min: 0.7, max: 0.7 }, activity: { min: 0.7, max: 0.7 } }),
    new LocationTypes("VI", { housing: { min: 0.7, max: 1.0 }, activity: { min: 0.9, max: 1.0 } })
  ]
)

project.getAffectation("Logements standards").reductions = [
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Contacter la commune ou les services compétents.`)
]

project.getAffectation("Logements avec encadrement ou étudiants").reductions = [
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer pour les logements avec encadrement ou étudiants (art. 34). Contacter la commune.`),
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Contacter la commune ou les services compétents.`),
]

project.getAffectation("Services à nombreuse clientèle").reductions = [
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité (art. 31).`),
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple (art. 32).`),
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Contacter la commune ou les services compétents.`),
]

project.getAffectation("Magasins à nombreuse clientèle").reductions = [
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité (art. 31).`),
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple (art. 32).`),
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Contacter la commune ou les services compétents.`),
]

project.getAffectation("Autres magasins").reductions = [
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité (art. 31).`),
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple (art. 32).`),
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Contacter la commune ou les services compétents.`),
]

project.getAffectation("Industrie et artisanat").reductions = [
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité (art. 31).`),
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple (art. 32).`),
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Contacter la commune ou les services compétents.`),
]

project.getAffectation("Entrepôts et dépôts").reductions = [
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité (art. 31).`),
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple (art. 32).`),
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Contacter la commune ou les services compétents.`),
]

project.getAffectation("Autres services").reductions = [
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité (art. 31).`),
  new Reduction(0.0, `Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple (art. 32).`),
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
      communes: communes,
      project: project,
      geojson: {
        'type': 'FeatureCollection',
        'features': []
      }
    }
  },
  computed: {
    count() {
      return this.geojson.features.length
    }
  },
  watch: {
    count() {

      console.log('project.loctypes')
      console.log(project.loctypes)


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
        // return this.project.loctypes[0]

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

    selectOption() {

      console.log(`App.vue | Project location type: ${this.project.locationType.name}`)

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
          this.project.parcels = this.geojson.features.map(x => x.properties.idmai)

        })
        .catch(error => console.log('error', error))

      console.log(`App.vue | Add new record with id=${feature.id}`)
      console.log(`App.vue | Project location type: ${this.project.locationType}`)

    },

    deleteRecord(id) {

      this.geojson.features = this.geojson.features.filter(function (feature) {
        return feature.id !== id
      })

      // update parcels in project
      this.project.parcels = this.geojson.features.map(x => x.properties.idmai)

      console.log(`App.vue | Delete item with id=${id}`)
      console.log(`App.vue | Project location type: ${this.project.locationType}`)
      console.log(this.project.locationType)
      console.log(this.project.loctypes)

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
/* @import 'https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Round'; */
/* @import 'https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons|Material+Icons+Outlined|Material+Icons+Round'; */
@import './assets/quasar.prod.css';
</style>