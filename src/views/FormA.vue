<template>
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

<script>
import communes from '../assets/data/communes.json'
import { Project, LocationTypes, Mob20, affectations } from "../helpers/classes.js"
import Search from "../components/Search.vue"
import Map from "../components/Map.vue"
import LocationTable from "../components/LocationTable.vue"

export default {
    name: 'FormA',
    components: {
        Map,
        LocationTable,
        Search,
    },
    props: {},
    emits: [],
    setup() {
        return {}
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
    computed: {
    },
    watch: {
    },
    methods: {
    },
    mounted() {
    },
    updated() {
    }
}
</script>

<style scoped></style>