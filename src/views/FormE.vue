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
        <div>
            {{ this.project.affectations[0].outputGroups }}
        </div>
        -->

        <div class="row" v-if="this.render">

            <!-- CAR PARKINGS SUMMARY TABLE -->
            <div id="summary-container" class="col-xs-12 col-sm-6 col-md-6">
                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table id="summary-table">
                        <caption class="text-subtitle1">Stationnements voitures</caption>
                        <thead>
                            <tr>
                                <th>Affectation</th>
                                <th>Type de place</th>
                                <!-- <th class="text-right"><q-icon name="directions_car" size="sm" /></th> -->
                                <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="directions_car" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="item in this.project.affectations.filter(e => e.active)">
                                <tr v-for="(subitem, iSub) in item.reducedOutput2.filter(e => e.group === 'car')">
                                    <td v-if="iSub === 0" :rowspan="item.outputs.filter(e => e.group === 'car').length" class="">{{ item.name }}</td>
                                    <td>{{ subitem.name }}</td>
                                    <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(3) }}</td>
                                    <!-- <td class="bg-light-blue-1 text-right">{{ Math.ceil(subitem.value) }}</td> -->
                                </tr>
                            </template>
                            <tr>
                                <td class="text-weight-bold">Total (arrondi sup.)</td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ Math.ceil(this.project.getReducedNeeds('car')) }}
                                    <!-- 
                                    {{ Math.ceil(this.project.affectations.filter(e => e.active).map((x) =>
                                        x.totalReducedOutput).reduce((acc, obj) => { return acc + obj }, 0)) }}
                                    -->
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>


            </div>


            <!-- BICYCLE PARKINGS SUMMARY TABLE -->
            <div id="summary-container" class="col-xs-12 col-sm-6 col-md-6">
                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table id="summary-table">
                        <caption class="text-subtitle1">Stationnements vélos (y.c. électriques &lt; 1kW)</caption>
                        <thead>
                            <tr>
                                <th>Affectation</th>
                                <th>Type de place</th>
                                <!-- <th class="text-right"><q-icon name="directions_bike" size="sm" /></th> -->
                                <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="directions_bike" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="item in this.project.affectations.filter(e => e.active)">
                                <tr v-for="(subitem, iSub) in item.reducedOutput2.filter(e => e.group === 'bicycle')">
                                    <td v-if="iSub === 0" :rowspan="item.outputs.filter(e => e.group === 'bicycle').length" class="">{{ item.name }}</td>
                                    <td>{{ subitem.name }}</td>
                                    <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(3) }}</td>
                                    <!-- <td class="bg-light-blue-1 text-right">{{ Math.ceil(subitem.value) }}</td> -->
                                </tr>
                            </template>
                            <tr>
                                <td class="text-weight-bold">Total (arrondi sup.)</td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ Math.ceil(this.project.getReducedNeeds('bicycle')) }}
                                    <!-- 
                                    {{ Math.ceil(this.project.affectations.filter(e => e.active).map((x) =>
                                        x.totalReducedOutput).reduce((acc, obj) => { return acc + obj }, 0)) }}
                                    -->
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>


            <!-- MOTORCYCLE PARKINGS SUMMARY TABLE -->
            <div id="summary-container" class="col-xs-12 col-sm-6 col-md-6">
                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table id="summary-table">
                        <caption class="text-subtitle1">Stationnements deux-roues motorisés</caption>
                        <thead>
                            <tr>
                                <th>Affectation</th>
                                <th>Type de place</th>
                                <!-- <th class="text-right"><q-icon name="motorcycle" size="sm" /></th>  -->
                                <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="motorcycle" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="item in this.project.affectations.filter(e => e.active)">
                                <tr v-for="(subitem, iSub) in item.reducedOutput2.filter(e => e.group === 'motorcycle')">
                                    <td v-if="iSub === 0" :rowspan="item.outputs.filter(e => e.group === 'motorcycle').length" class="">{{ item.name }}</td>
                                    <td>{{ subitem.name }}</td>
                                    <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(3) }}</td>
                                    <!-- <td class="bg-light-blue-1 text-right">{{ Math.ceil(subitem.value) }}</td> -->
                                </tr>
                            </template>
                            <tr>
                                <td class="text-weight-bold">Total (arrondi sup.)</td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ Math.ceil(this.project.getReducedNeeds('motorcycle')) }}
                                    <!-- 
                                    {{ Math.ceil(this.project.affectations.filter(e => e.active).map((x) =>
                                        x.totalReducedOutput).reduce((acc, obj) => { return acc + obj }, 0)) }}
                                    -->
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>


            <!-- CHARGING STATIONS SUMMARY TABLE -->
            <div id="summary-container" class="col-xs-12 col-sm-6 col-md-6">
                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table id="summary-table">
                        <caption class="text-subtitle1">Équipements pour véhicules électriques</caption>
                        <thead>
                            <tr>
                                <th>Affectation</th>
                                <th>Type d'équipement</th>
                                <!-- <th class="text-right"><q-icon name="ev_station" size="sm" /></th> -->
                                <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="ev_station" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="item in this.project.affectations.filter(e => e.active)">
                                <tr v-for="(subitem, iSub) in item.reducedOutput2.filter(e => e.group === 'station')">
                                    <td v-if="iSub === 0" :rowspan="item.outputs.filter(e => e.group === 'station').length" class="">{{ item.name }}</td>
                                    <td>{{ subitem.name }}</td>
                                    <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(3) }}</td>
                                    <!-- <td class="bg-light-blue-1 text-right">{{ Math.ceil(subitem.value) }}</td> -->
                                </tr>
                            </template>
                            <tr>
                                <td class="text-weight-bold">Total (arrondi sup.)</td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ Math.floor(this.project.getReducedNeeds('station')) }}
                                    <!-- 
                                    {{ Math.ceil(this.project.affectations.filter(e => e.active).map((x) =>
                                        x.totalReducedOutput).reduce((acc, obj) => { return acc + obj }, 0)) }}
                                    -->
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
    props: {}, // { 'project': Object },
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
            return (this.project.commune !== null) & (this.project.locationType !== null) & this.project.hasAffectation
        },

    },
    mounted() {
        // console.log('FORM E - mounted')
        // console.log(this.project.affectations.filter(e => e.active).map(x => ({ name: x.name, value: x.reducedOutput })).flat(1))
    },
    methods: {
        print,
    }
}
</script>

<style scoped>
@import '../assets/styles/table.css';
</style>