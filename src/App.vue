<template>
  <!-- HEADER -->
  <q-layout view="hHh lpR fFf" class="shadow-2 rounded-borders">
    <q-header>
      <q-toolbar class="bg-white text-black custom-header">

        <q-toolbar-title class="text-center">CALCUL DES STATIONNEMENTS ET ÉQUIPEMENTS</q-toolbar-title>

        <a href="https://www.ne.ch/autorites/DDTE/SCAT/Pages/accueil.aspx" target="_blank"><img src="./assets/img/logo_right.svg" alt="Neuchâtel" /></a>

      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-px-none q-pb-xs">

        <!-- 1. PROJECT LOCATION -->
        <FormSection title="1. Localisation du projet">
          <template v-slot:content>
            <FormA :project="project" @updateProject=""></FormA>
          </template>
        </FormSection>

        <!-- 2. RAW PARKING NEEDS -->
        <FormSection title="2. Calcul du besoin brut (article 27 RELConstr.)">
          <template v-slot:content>
            <FormB :project="project" @updateProject=""></FormB>
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
        <FormSection title="5. Résumé des stationnements et équipements à réaliser">
          <template v-slot:content>
            <FormE :project="project"></FormE>
          </template>
        </FormSection>


      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from 'vue'
import { store } from './store/store.js'
import FormSection from "./components/FormSection.vue"
import FormA from "./views/FormA.vue"
import FormB from "./views/FormB.vue"
import FormC from "./views/FormC.vue"
import FormD from "./views/FormD.vue"
import FormE from "./views/FormE.vue"

export default {
  name: 'App',
  components: {
    FormSection,
    FormA,
    FormB,
    FormC,
    FormD,
    FormE,
  },
  setup() {
    return {
      map: ref()
    }
  },
  data() {
    return {
      store,
      project: store.project,
    }
  },
  mounted() {
  },
  computed: {
  },
  watch: {
  },
  methods: {
    /*
    updateProject(obj) {
      this.project = obj
      this.$nextTick(() => { this.$refs.form.validate() })
    }
    */
  }
}
</script>

<style>
@import './assets/styles/main.css';
@import './assets/styles/quasar.prod.css';
</style>