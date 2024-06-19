<template>
    <!-- 1. LOCATION -->
    <div class="q-px-md">

        <!-- <button @click="validateForm">VALIDATE FORM</button> -->

        <!-- FORM -->
        <q-form ref="formA" greedy no-error-focus no-reset-focus @validation-success="validationSuccess" @validation-error="validationError">

            <!-- PROJECT N° SATAC -->
            <div class="bg-grey-1 q-pa-md q-my-md rounded-borders">
                <q-input class="col" bg-color="white" outlined label="N° SATAC du projet (si disponible)" type="text" name="project.satac" v-model="project.satac" @update:model-value="validateForm" :rules="[(val) => validateSatac(val) || 'Seuls les chiffres sans espaces sont admis']">
                    <template v-slot:hint>
                        Entrer le n° SATAC avec des chiffres seulement et sans espaces
                    </template>
                </q-input>
            </div>

            <!-- PROJECT TYPE TYPE INFOBOX  -->
            <!-- 
            <q-list class="q-my-lg rounded-borders">
                <q-expansion-item rounded-borders class="bg-grey-1">
                    <template v-slot:header>
                        <q-item-section avatar>
                            <q-icon name="help" color="orange-7" text-color="black" size="2rem" />
                        </q-item-section>

                        <q-item-section>
                            <div class="text-body2 text-weight-bold">Information et aide sur la nature du projet</div>
                            <div class="text-caption">Cliquer pour ouvrir/fermer</div>
                        </q-item-section>

                        <q-item-section side>
                        </q-item-section>
                    </template>

                    <q-card flat class="q-pa-none">

                        <q-card-section class="">

                            <div class="text-body2">

                                Pour de plus amples renseignements nous vous laissons le soin de consulter l’aide à l’application EN-106 disponible sur le site de la Conférence des directeurs cantonaux de l’énergie (<a href="https://www.endk.ch/fr/professionnels/aides-a-lapplication/en101-142-muken-2014" target="_blank">https://www.endk.ch/fr/professionnels/aides-a-lapplication/en101-142-muken-2014</a>).

                            </div>
                        </q-card-section>

                    </q-card>

                </q-expansion-item>
            </q-list>
            -->

            <!-- PROJECT TYPE -->
            <div class="bg-grey-1 q-pa-md q-my-md rounded-borders">
                <q-select clearable outlined bottom-slots bg-color="white" v-model="project.type" :options="project_types" option-value="name" option-label="name" @update:model-value="validateForm" label="Nature du projet" :rules="[(val) => val !== null || 'Veuillez choisir le type de projet']">

                    <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">

                            <q-item-section side>

                                <q-avatar rounded size="md" font-size="22px" color="blue-10" text-color="white">
                                    <img height="50%" width="50%" :src="scope.opt.icon">
                                </q-avatar>

                            </q-item-section>

                            <q-item-section>
                                <q-item-label>{{ scope.opt.name }}</q-item-label>
                                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                            </q-item-section>

                            <q-tooltip>
                                {{ scope.opt.equipement ? 'Nécessite le calcul d’équipement de recharge pour véhicules électriques' : 'Ne nécessite pas de calcul d’équipement de recharge pour véhicules électriques' }}
                            </q-tooltip>

                        </q-item>
                    </template>

                    <template v-slot:hint>
                        Choisir la nature du projet
                    </template>

                </q-select>
            </div>


            <!-- COMMUNE -->
            <div class="bg-grey-1 q-pa-md q-my-md rounded-borders">
                <q-select outlined bottom-slots bg-color="white" v-model="project.commune" :options="communes" option-value="comnom" option-label="comnom" @update:model-value="resetParcels()" label="Commune" :rules="[(val) => val !== null || 'Veuillez choisir la commune']">

                    <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                            <q-item-section>
                                <q-item-label>{{ scope.opt.comnom }}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </template>

                    <template v-slot:hint>
                        Choisir la commune
                    </template>
                </q-select>
            </div>

            <!-- PARCEL SEARCH -->
            <div class="bg-grey-1 q-pa-md q-my-md rounded-borders">
                <Search :geojson="geojson" :project="project" @addOption="addRecord"></Search>
            </div>

            <!-- PARCEL MAP -->
            <Map ref="map" :geojson="geojson"></Map>
            <div class="q-my-md">
                <q-card class="bg-blue-grey-8 text-white">
                    <q-card-section>
                        <div class="text-h6">{{ this.geojson.features.length }} parcelle(s) sélectionnée(s)</div>
                    </q-card-section>
                </q-card>
            </div>

            <!-- PARCEL TABLE -->
            <LocationTable :rows="geojson.features" @deleteItem="deleteRecord" @focusItem="focusRecord">
            </LocationTable>

            <!-- LOCATION TYPE -->
            <div class="bg-grey-1 q-pa-md q-my-md rounded-borders">

                <q-select outlined bottom-slots bg-color="white" v-model="project.locationType" :options="project.loctypes.filter(e => e.active)" option-value="name" option-label="name" @update:model-value="validateForm" label="Type de localisation du projet" :rules="[validateLocalisation]">

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
            <q-list class="q-my-lg rounded-borders" v-if="store.project.loctypes.filter(e => e.active).length > 1">
                <q-expansion-item rounded-borders class="bg-grey-1">
                    <!-- <q-expansion-item icon="help" label="Informations et aide sur le calcul" caption="Cliquer pour ouvrir l'aide" class="bg-grey-1"> -->
                    <template v-slot:header>
                        <q-item-section avatar>
                            <q-icon name="help" color="orange-7" text-color="black" size="2rem" /> <!-- #f78a15 -->

                        </q-item-section>

                        <q-item-section>
                            <div class="text-body2 text-weight-bold">Information et aide sur le type de localisation</div>
                            <div class="text-caption">Cliquer pour ouvrir/fermer</div>
                        </q-item-section>

                        <q-item-section side>

                        </q-item-section>
                    </template>

                    <!-- <q-card flat class="bg-grey-1 q-pa-md q-my-md infobox" v-if="this.render"> -->
                    <q-card flat class="q-pa-none">

                        <!-- <q-card v-if="store.project.loctypes.filter(e => e.active).length > 1" flat class="bg-grey-1 q-pa-md q-my-md infobox"> -->

                        <!-- <q-card-section horizontal> -->

                        <q-card-section class="q-pa-sm">
                            <!-- <div class="text-body2 text-weight-bold q-mb-sm">Justification du type de localisation</div> -->


                            <div class="text-body2">
                                <ul>
                                    <li>La ou les parcelle(s) se trouve(nt) sur plusieurs types de localisation. Un seul type de
                                        localisation doit être choisi. Il faut brièvement justifier le choix dans le champ ci-dessous.
                                    </li>

                                    <li>Le choix d’un type de localisation peut notamment être justifié par le fait qu’il recouvre
                                        la majorité de la ou des parcelle(s) concernée(s) ; qu’il recouvre le bâtiment ou
                                        l’emplacement de l’entrée principale du bâtiment.
                                    </li>
                                </ul>

                            </div>
                        </q-card-section>

                        <!-- </q-card-section> -->

                    </q-card>

                </q-expansion-item>
            </q-list>

            <!-- LOCATION TYPE JUSTIFICATION  -->
            <div v-if="store.project.loctypes.filter(e => e.active).length > 1" class="bg-grey-1 q-pa-md q-my-sm rounded-borders">
                <q-input v-model="project.locationTypeJustification" outlined bg-color="white" type="textarea" maxlength="500" counter label="Justification du type de localisation du projet" @update:model-value="validateForm" :rules="[(val) => val.length > 3 || 'Veuillez justifier le choix du type de localisation']" />
            </div>

        </q-form>

    </div>
</template>

<script>
import { ref } from 'vue'
import { store } from '../store/store.js'
import communes from '../assets/data/communes.json'
import { Mob20, project_types } from "../helpers/classes.js"
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

        return {
            map: ref()
        }
    },
    data() {
        return {
            store,
            // validity: { 'A': false, 'B': false, 'C': false, 'D': false, 'E': false },
            communes: communes,
            project_types: project_types,
            project: store.project,
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

            // reset areas to 0
            store.project.locationType = null
            store.project.loctypes.forEach(location => {
                location.area = 0.0
                location.ratio = 0.0
            })

            let totalArea = 0.0

            if (this.geojson.features.length > 0) {

                this.geojson.features.forEach(feature => {
                    feature.properties.locations.forEach(location => {
                        let index = store.project.loctypes.findIndex(item => item.name === location.type)
                        store.project.loctypes[index].area += location.area
                        totalArea += location.area
                    })
                })

                // compute relative area for each type
                store.project.loctypes.forEach(item => {
                    item.ratio = item.area / totalArea
                })

                // if there is only one location type, select it by default
                // console.log(store.project.loctypes.find(e => e.active))
                if (store.project.loctypes.filter(e => e.active).length === 1) {
                    store.project.locationType = store.project.loctypes.find(e => e.active)
                }

                store.project.loctypes.sort((a, b) => b.area - a.area)
                this.validateForm()

            }

        }
    },
    mounted() {
        this.validateForm()
    },
    updated() {
        this.validateForm()
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
            store.project.parcels = []
            this.geojson.features = []
            this.validateForm()
        },
        addRecord(feature) {
            var headers = new Headers()
            headers.append("Content-Type", "application/json")

            var requestOptions = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ "type": "FeatureCollection", "features": [feature] }),
                redirect: 'follow'
            }

            fetch("https://sitn.ne.ch/apps/stationnement/", requestOptions)
                .then(response => response.json())
                .then(result => {

                    feature.properties.locations = []
                    result.features.forEach(item => {
                        feature.properties.locations.push(new Mob20(item.properties.type_localisation, item.properties.intersection_area))
                    })

                    // add feature to geojson
                    this.geojson.features.push(feature)

                    // update parcels in project
                    store.project.parcels = this.geojson.features.map(x => (`n° ${x.properties.idmai.split("_")[1]}, cadastre de ${x.properties.cadnom}`))
                })
                .catch(error => console.log('error', error))

            this.validateForm()

        },
        deleteRecord(id) {
            this.geojson.features = this.geojson.features.filter((x) => (x.id !== id))

            // update parcels in project
            store.project.parcels = this.geojson.features.map((x) => x.properties.idmai)
            // console.log(`App.vue | Delete item with id=${id}`)
            this.validateForm()
        },
        focusRecord(id) {
            this.map.zoomTo(id)
        },
        validateForm() {
            if (this.$refs.hasOwnProperty('formA')) {
                if (this.$refs.formA !== null) {
                    // this.$refs.formA.validate()
                    this.$nextTick(() => { this.$refs.formA.validate() })
                    // console.log(`${this.$options.name} | validateForm()`)
                    // console.log(this.store.validity)
                }
            }
        },
        validationSuccess() {
            // console.log(`${this.$options.name} | validationSuccess()`)
            this.store.validity.A = true
            // console.log(this.store.validity)
        },
        validationError() {
            // console.log(`${this.$options.name} | validationError()`)
            this.store.validity.A = false
            // console.log(this.store.validity)
        },
    }
}
</script>

<style scoped></style>