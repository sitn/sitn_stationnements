<template>
    <!-- 5. SUMMARY -->
    <div class="q-pa-md">

        <q-banner inline-actions class="text-white bg-red q-my-md q-pa-md rounded-borders" v-if="!this.render">
            <template v-slot:avatar>
                <q-icon name="error" color="white" />
            </template>
            <span class="text-body1">Veuillez compléter l'étape précédente</span>
        </q-banner>

        <!-- 
        <div class="row" v-if="this.render">
            {{ this.project.getHousingCount() }}
            {{ this.project.affectations
                .filter(x => (x.active))
                .map((x) => x.variables)
                .flat()
                .filter(x => (x.id === "n_housings"))
                .reduce((acc, obj) => { return acc + obj.value }, 0) }}
        </div>
        -->

        <div class="row" v-if="this.render">

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
                            <template v-for="item in this.project.affectations.filter(e => e.active)">
                                <tr v-for="(subitem, iSub) in item.getReducedOutputs(['car', 'special'])">
                                    <td v-if="iSub === 0" :rowspan="item.getOutputs(['car', 'special']).length" class="">{{ item.name }}</td>
                                    <td>{{ subitem.name }}</td>
                                    <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(3) }}</td>
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
            <div id="summary-container" class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
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
                                <td>Niveau C2</td>
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
                                <td rowspan="1">Pas concerné<br>{{ this.project.getAffectationNames('Pas concerné').length > 0 ? ` (${this.project.getAffectationNames('Pas concerné').join('; ')})` : '' }}</td>
                                <td>Aucun</td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ this.project.getStations("Pas concerné") }}
                                </td>
                            </tr>
                            <tr>
                                <td class="text-weight-bold">Total</td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ Math.ceil(this.project.getReducedNeeds(['car', 'special'])) }}
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>

            </div>


            <!-- CHARGING STATIONS SUMMARY TABLE (DETAILS) -->
            <!-- 
            <div id="summary-container" class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table id="summary-table">
                        <caption class="text-subtitle1">Détails - Équipements pour véhicules électriques (art. 34 RELCEn)</caption>
                        <thead>
                            <tr>
                                <th>Affectation</th>
                                <th>Type d'équipement</th>
                                <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="ev_station" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="item in this.project.affectations.filter(e => e.active)">
                                <tr v-for="(subitem, iSub) in item.reducedOutput2.filter(e => e.group === 'station')">
                                    <td v-if="iSub === 0" :rowspan="item.outputs.filter(e => e.group === 'station').length" class="">{{ item.name }}</td>
                                    <td>{{ subitem.name }}</td>
                                    <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(3) }}</td>
                                </tr>
                            </template>
                            <tr>
                                <td class="text-weight-bold">Total (arrondi inf.)</td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ Math.floor(this.project.getReducedNeeds('station')) }}
                                    {{ this.project.getReducedNeeds('station').toFixed(3) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        -->

            <!-- MOTORCYCLE PARKINGS SUMMARY TABLE -->
            <div id="summary-container" class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table class="total-row">
                        <caption class="text-subtitle1">
                            Stationnements deux-roues motorisés > 45km/h (art. 37c RELConstr.)
                        </caption>
                        <thead>
                            <tr>
                                <th>Affectation</th>
                                <th>Type de place</th>
                                <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="motorcycle" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="item in this.project.affectations.filter(e => e.active)">
                                <tr v-for="(subitem, iSub) in item.getReducedOutputs('motorcycle')">
                                    <td v-if="iSub === 0" :rowspan="item.getOutputs('motorcycle').length" class="">{{ item.name }}</td>
                                    <td>{{ subitem.name }}</td>
                                    <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(3) }}</td>
                                </tr>
                            </template>
                            <tr>
                                <td class="text-weight-bold">Total (arrondi sup.)</td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ Math.ceil(this.project.getReducedNeeds('motorcycle')) }}
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
                            <template v-for="item in this.project.affectations.filter(e => e.active)">
                                <tr v-for="(subitem, iSub) in item.getReducedOutputs('bicycle')">
                                    <td v-if="iSub === 0" :rowspan="item.getOutputs('bicycle').length" class="">{{ item.name }}</td>
                                    <td>{{ subitem.name }}</td>
                                    <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(3) }}</td>
                                </tr>
                            </template>
                            <tr>
                                <td class="text-weight-bold">Total (arrondi sup.)</td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ Math.ceil(this.project.getReducedNeeds('bicycle')) }}
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
            return this.project.hasCommune & this.project.hasLocationType & this.project.hasAffectation & this.project.hasZoneFactors
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