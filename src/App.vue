<template>
  <div class="q-pa-md">
    <q-stepper v-model="step" ref="stepper" color="primary" animated>
      <!-- LOCATION FORM -->
      <q-step :name="1" title="Localisation" icon="assignment" :done="step > 1">
        <div class="q-pa-md">
          <div class="text-h5">Localisation du projet</div>
          <Search @addOption="addRecord"></Search>
          <Map ref="map" :geojson="geojson"></Map>
          <Table :rows="geojson.features" @action="" @deleteItem="deleteRecord" @focusItem="focusRecord"></Table>
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
import GeoJSON from 'ol/format/GeoJSON.js';
import { Vector as VectorLayer } from 'ol/layer.js';

// Classes
class Mob20 {
  constructor(type, area) {
    this.type = type;
    this.area = area;
  }
}

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
      focus: null,
      options: null,
      geojson: {
        'type': 'FeatureCollection',
        'features': []
      }
    }
  },
  computed: {
    olFeatures() {
      return new GeoJSON().readFeatures(this.geojson);
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

      console.log(toRaw(feature))

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
      this.map.hello(id)
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
