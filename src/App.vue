<template>
  <div class="bg-grey-3 q-pa-md">
    <q-stepper v-model="step" ref="stepper" color="primary" animated>
      <!-- LOCATION FORM -->
      <q-step :name="1" title="Localisation" icon="assignment" :done="step > 1">
        <div class="q-pa-md">
          <div class="text-h5">Étape 1: Localisation du projet</div>
          <Search @addOption="addRecord"></Search>
          <Map ref="map" :geojson="geojson"></Map>
          <Table :rows="geojson.features" @action="" @deleteItem="deleteRecord" @focusItem="focusRecord"></Table>
        </div>
        <div class="q-pa-md">
          <div class="text-h5">Étape 2: Calcul du besoin brut</div>
          <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders" v-for="(item, key) in factors">
            <label class="text-h7 ">{{ item.affectation }}</label>
            <div class="row q-col-gutter-sm">

              <q-input class="col-3" bg-color="white" outlined label="" type="number" name="item.affectation"
                v-model.number="item.area" min="0.0" max="Inf">
                <template v-slot:label>
                  Surface brute de plancher (SBP) en m<sup>2</sup>
                </template>
                <!--
                <template v-slot:append>
                  m<sup>2</sup>
                </template>
                -->
              </q-input>
              <q-input v-if="item.isHousing" class="col-3" bg-color="white" outlined label="Nombre" type="number"
                name="item.housing" v-model.number="item.housing" min="0.0" max="Inf">
              </q-input>
              <q-input class="col-3" bg-color="light-blue-1" outlined label="Besoin brut habitant" type="number"
                name="item.rawResidentNeed" v-model.number="item.rawResidentNeed" readonly>
              </q-input>
              <q-input class="col-3" bg-color="light-blue-1" outlined label="Besoin brut visiteur" type="number"
                name="item.rawVisitorNeed" v-model.number="item.rawVisitorNeed" readonly>
              </q-input>

              

            </div>
          </div>
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

class Factor {
  constructor(type, affectation, areaFactor, housingFactor, activityFactor, area, housing) {
    this.type = type;
    this.affectation = affectation;
    this.areaFactor = areaFactor;
    this.housingFactor = housingFactor;
    this.activityFactor = activityFactor;
    this.area = area;
    this.housing = housing;
  }
  get isHousing() {
    return this.type === "Logement";
  }
  get rawResidentNeed() {
    return this.area * this.areaFactor * this.housingFactor
  }
  get rawVisitorNeed() {
    return this.area * this.areaFactor * this.activityFactor
  }
}

const factors = [];
factors.push(new Factor("Logement", "Logements standards", 0.01, 1, 0.1, 0, 0));
factors.push(new Factor("Logement", "Logements avec encadrement ou étudiants", 0.01, 1, 0.1, 0, 0));
factors.push(new Factor("Activité", "Services à nombreuse clientèle", 0.01, 2, 1, 0, 0));
factors.push(new Factor("Activité", "Magasins à nombreuse clientèle", 0.01, 2, 8, 0, 0));
factors.push(new Factor("Activité", "Autres magasins", 0.01, 1.5, 3.5, 0, 0));
factors.push(new Factor("Activité", "Industrie et artisanat", 0.01, 1, 0.2, 0, 0));
factors.push(new Factor("Activité", "Entrepôts et dépôts", 0.01, 0.1, 0.01, 0, 0));
factors.push(new Factor("Activité", "Autres services", 0.01, 2, 0.5, 0, 0));


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
