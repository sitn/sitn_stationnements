<template>
    <!-- 5. SUMMARY -->
    <div class="q-pa-md">

        <q-banner inline-actions class="text-white bg-red q-my-md q-pa-md rounded-borders" v-if="!this.render">
            <template v-slot:avatar>
                <q-icon name="error" color="white" />
            </template>
            <span class="text-body1">Veuillez compléter l'étape précédente</span>
        </q-banner>

        <div class="row overflow-scroll" v-if="this.render">

            <!-- CAR PARKINGS SUMMARY TABLE -->
            <div id="summary-container" class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table class="total-row">
                        <caption class="text-subtitle1">Stationnements voitures (art. 30 RELConstr.)</caption>
                        <thead>
                            <tr>
                                <th>Affectation</th>
                                <th>Type de place</th>
                                <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="directions_car" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="item in this.project.getAffectations()">
                                <tr v-for="(subitem, iSub) in item.getReducedOutputs(['car', 'special'])">
                                    <td v-if="iSub === 0" :rowspan="item.getOutputs(['car', 'special']).length" class="">{{ item.name }}</td>
                                    <td>{{ subitem.name }}</td>
                                    <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(2) }}</td>
                                </tr>
                            </template>
                            <tr>
                                <td class="text-weight-bold">Total (arrondi sup.)</td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ Math.ceil(this.project.getReducedNeeds(['car', 'special'])) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>

            <!-- CHARGING STATIONS SUMMARY TABLE -->
            <div id="summary-container" class="col-xs-12 col-sm-12 col-md-12 col-lg-6" v-if="this.project.type.equipement">
                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table class="total-row">
                        <caption class="text-subtitle1">Équipements pour véhicules électriques (art. 34 RELCEn.)</caption>
                        <thead>
                            <tr>
                                <th>Catégorie (affectations)</th>
                                <th>Type d'équipement (selon SIA 2060)</th>
                                <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="ev_station" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td rowspan="1">Logements<br>{{ this.project.getAffectationNames('Logement').length > 0 ? ` (${this.project.getAffectationNames('Logement').join('; ')})` : '' }}</td>
                                <td>Niveau D (bornes)</td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ this.project.getStations("Logement") }}
                                </td>
                            </tr>
                            <tr>
                                <td rowspan="1">Activités<br>{{ this.project.getAffectationNames('Activité').length > 0 ? ` (${this.project.getAffectationNames('Activité').join('; ')})` : '' }}</td>
                                <td>Niveau D (bornes)</td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ this.project.getStations("Activité") }}
                                </td>
                            </tr>
                            <tr>
                                <td rowspan="1">Logements et activités<br>(cf. affectations ci-dessus)</td>
                                <td>Niveau B</td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ Math.ceil(this.project.getReducedNeeds(['car', 'special'])) - this.project.getStations("Logement") - this.project.getStations("Activité") - this.project.getStations("Pas concerné") }}
                                </td>
                            </tr>
                            <tr>
                                <td class="text-weight-bold">Total</td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ Math.ceil(this.project.getReducedNeeds(['car', 'special'])) - this.project.getStations("Pas concerné") }}
                                </td>
                            </tr>

                        </tbody>
                    </table>

                    <br>
                    <!-- <p> {{ this.project.getStations("Pas concerné") }} place(s) pas concernée(s)</p> -->
                    <div class="text-caption" v-if="this.project.getAffectationNames('Pas concerné').length > 0">Affectation(s) non-concernée(s): {{ `${this.project.getAffectationNames('Pas concerné').join('; ')}` }}</div>

                </div>

            </div>

            <!-- MOTORCYCLE PARKINGS SUMMARY TABLE -->
            <div id="summary-container" class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table class="total-row">
                        <caption class="text-subtitle1">
                            Stationnements deux-roues motorisés (art. 37c RELConstr.)
                        </caption>
                        <thead>
                            <tr>
                                <th>Affectation</th>
                                <th>Type de place</th>
                                <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="motorcycle" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for=" item  in  this.project.getAffectations() ">
                                <tr v-for="( subitem, iSub ) in  item.getReducedOutputs(['motorcycle']) ">
                                    <td v-if="iSub === 0" :rowspan="item.getOutputs(['motorcycle']).length" class="">{{ item.name }}</td>
                                    <td>{{ subitem.name }}</td>
                                    <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(2) }}</td>
                                </tr>
                            </template>
                            <tr>
                                <td class="text-weight-bold">Total (arrondi sup.)</td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ Math.ceil(this.project.getReducedNeeds(['motorcycle'])) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>

            <!-- BICYCLE PARKINGS SUMMARY TABLE -->
            <div id="summary-container" class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table class="total-row">

                        <caption class="text-subtitle1">Stationnements vélos, y.c. électriques et spéciaux (art. 37b RELConstr.)</caption>

                        <thead>
                            <tr>
                                <th>Affectation</th>
                                <th>Type de place</th>
                                <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="directions_bike" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for=" item  in  this.project.getAffectations() ">
                                <tr v-for="( subitem, iSub ) in  item.getReducedOutputs(['bicycle']) ">
                                    <td v-if="iSub === 0" :rowspan="item.getOutputs(['bicycle']).length" class="">{{ item.name }}</td>
                                    <td>{{ subitem.name }}</td>
                                    <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(2) }}</td>
                                </tr>
                            </template>
                            <tr>
                                <td class="text-weight-bold">Total (arrondi sup.)</td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ Math.ceil(this.project.getReducedNeeds(['bicycle'])) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>

        </div>

        <div class="row" v-if="this.render">
            <q-btn id="print-btn" color="white" text-color="black" icon="print" label="Imprimer PDF" @click="print(project)" class="no-print" />
        </div>

    </div>
</template>

<script>

import { store } from '../store/store.js'
import { print } from '../helpers/print.js';

export default {
    name: 'FormE',
    components: {},
    props: {},
    emits: [],
    setup() {
        return {
        }
    },
    data() {
        return {
            store,
            project: store.project,
        }
    },
    computed: {
        render() {
            return store.validity.A & store.validity.B & store.validity.C & store.validity.D
            // return this.project.hasCommune & this.project.hasLocationType & this.project.hasAffectation & this.project.hasZoneFactors
        },

    },
    methods: {
        print,
    }
}
</script>

<style scoped>
@import '../assets/styles/table.css';
</style>