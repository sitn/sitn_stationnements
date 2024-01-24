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

            <!-- CHARGING STATIONS SUMMARY TABLE -->
            <div id="summary-container" class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table class="total-row">
                        <caption class="text-subtitle1">Équipements pour véhicules électriques (art. 34 RELCEn.)</caption>
                        <thead>
                            <tr>
                                <th>Catégorie (affectations)</th>
                                <th>Type d'équipement (selon SIA 2060)</th>
                                <!-- <th class="text-right"><q-icon name="ev_station" size="sm" /></th> -->
                                <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="ev_station" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td rowspan="1">Logements<br>{{ this.project.getAffectationNames('Logement').length > 0 ? ` (${this.project.getAffectationNames('Logement').join('; ')})` : '' }}</td>
                                <td># niveau D (bornes)</td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ this.project.getStations("Logement") }}
                                    <!-- {{ Math.floor(this.project.getReducedNeeds('station')) }} -->
                                </td>
                            </tr>
                            <tr>
                                <td rowspan="1">Activités<br>{{ this.project.getAffectationNames('Activité').length > 0 ? ` (${this.project.getAffectationNames('Activité').join('; ')})` : '' }}</td>
                                <td># niveau C2</td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ this.project.getStations("Activité") }}
                                    <!-- {{ Math.floor(this.project.getReducedNeeds('station')) }} -->
                                </td>
                            </tr>
                            <tr>
                                <td rowspan="1">Logements et activités<br>(cf. affectations ci-dessus)</td>
                                <td># niveau B</td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ Math.ceil(this.project.getReducedNeeds('car')) - this.project.getStations("Logement") - this.project.getStations("Activité") - this.project.getStations("Pas concerné") }}
                                </td>
                            </tr>
                            <tr>
                                <td rowspan="1">Pas concerné<br>{{ this.project.getAffectationNames('Pas concerné').length > 0 ? ` (${this.project.getAffectationNames('Pas concerné').join('; ')})` : '' }}</td>
                                <td>Aucun</td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ this.project.getStations("Pas concerné") }}
                                    <!--  {{ Math.floor(this.project.getReducedNeeds('station')) }} -->
                                </td>
                            </tr>
                            <tr>
                                <td class="text-weight-bold">Total</td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ Math.ceil(this.project.getReducedNeeds('car')) }}
                                </td>
                            </tr>


                            <!-- 
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
                                </td>
                            </tr>
                            -->


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
                            <!-- Stationnements deux-roues motorisés > 45km/h (art. 37c RELConstr.) -->
                            Stationnements deux-roues motorisés > 45km/h (art. 37c RELConstr.)
                        </caption>
                        <!-- 
                        <caption class="text-subtitle1">
                            <div>Stationnements deux-roues motorisés > 45km/h</div>
                            <div>(art. 37c RELConstr.)</div>
                        </caption>
                        -->
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


            <!-- BICYCLE PARKINGS SUMMARY TABLE -->
            <div id="summary-container" class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table class="total-row">
                        <!-- <caption class="text-subtitle1">Stationnements vélos, y.c. électriques &lt; 1kW (art. 37b RELConstr.)</caption>-->
                        <caption class="text-subtitle1">Stationnements vélos, y.c. électriques et spéciaux (art. 37b RELConstr.)</caption>
                        <!-- 
                        <caption class="text-subtitle1">
                            <div>Stationnements vélos, y.c. électriques &lt; 1kW</div>
                            <div>(art. 37b RELConstr.)</div>
                        </caption>
                        -->

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

        </div>

        <div class="row" v-if="this.render">
            <q-btn id="print-btn" color="white" text-color="black" icon="print" label="Imprimer PDF" @click="print(project)" class="no-print" />
        </div>

        <!-- 
        <div class="row" v-if="this.render">
            {{
                this.project.affectations.filter(o => o.active && o.outputs.length > 0)
                    .map(o => [

                        // TABLE FIRST ROW
                        [
                            // Affectation
                            { rowSpan: o.outputs.filter(e => e.group === 'car').length + 1, text: o.name, style: 'tableBody', alignment: 'left' },

                            // Variable(s)
                            // { rowSpan: o.outputs.length + 1, ul: o.variables.filter((x) => x.type === 'measurement').map((x) => (`${x.name} = ${x.value}`)), style: 'tableBody', alignment: 'left', noWrap: false },
                            { rowSpan: o.outputs.filter(e => e.group === 'car').length + 1, ul: o.variables.filter((x) => x.type === 'measurement').map((x) => (`${x.name} = ${x.value}`)), style: 'tableBody', alignment: 'left', noWrap: false },

                            // Facteur(s) de réduction
                            { rowSpan: o.outputs.filter(e => e.group === 'car').length + 1, ul: o.variables.filter((x) => (x.type === 'special reduction') & (x.value > 0)).map((x) => (`${x.name} = ${x.value} ${x.unit}`)), style: 'tableBody', alignment: 'left' },
                            // { rowSpan: o.outputs.length + 1, ul: o.variables.filter((x) => (x.type === 'special reduction') & (x.value > 0)).map((x) => (`${x.name} = ${x.value} ${x.unit}`)), style: 'tableBody', alignment: 'left' },

                            // Catégorie
                            { text: o.outputs.filter(e => e.group === 'car')[0].name, style: 'tableBody', alignment: 'left' },
                            // { text: o.outputs[0].name, style: 'tableBody', alignment: 'left' },

                            // Besoin brut
                            // { text: o.output[0].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                            { text: o.rawOutput.filter(e => e.group === 'car')[0].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                            // % Loc.
                            { text: o.variables.filter((x) => x.type === 'reduction').map((x) => (`${x.value} ${x.unit}`)), style: 'tableBody', alignment: 'right', noWrap: true },

                            // Besoin net
                            // { text: o.netOutput[0].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                            { text: o.netOutput2.filter(e => e.group === 'car')[0].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                            // Besoin net réduit
                            // { text: o.reducedOutput[0].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                            { text: o.reducedOutput2.filter(e => e.group === 'car')[0].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                            // Places à réaliser
                            // { text: o.reducedOutput[0].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                            { text: o.reducedOutput2.filter(e => e.group === 'car')[0].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                            // { text: Math.ceil(o.reducedOutput[0]), style: 'tableBody', alignment: 'right', noWrap: true },
                        ],

                        // TABLE BODY ROWS (ROW 2 -> LAST)
                        ...o.outputs.filter(e => e.group === 'car').slice(1).map(
                            (el, i) => [
                                {},
                                {},
                                {},

                                // Catégorie
                                { text: el.name, style: 'tableBody', alignment: 'left' },

                                // Besoin brut
                                { text: o.rawOutput.filter(e => e.group === 'car')[i + 1].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                // { text: o.output[i + 1].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                                // Facteur(s) de réduction
                                { text: o.variables.filter((x) => x.type === 'reduction').map((x) => (`${x.value} ${x.unit}`)), style: 'tableBody', alignment: 'right', noWrap: true },

                                // Besoin net
                                // { text: o.netOutput[i + 1].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                { text: o.netOutput2.filter(e => e.group === 'car')[i + 1].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                                // Besoin net réduit
                                { text: o.reducedOutput2.filter(e => e.group === 'car')[i + 1].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                                // Places à réaliser
                                { text: o.reducedOutput2.filter(e => e.group === 'car')[i + 1].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                            ]
                        ),

                        [
                            {},
                            {},
                            {},

                            // Sous-total
                            { text: 'Sous-total', style: 'tableBody', bold: true, alignment: 'left', noWrap: true },

                            // Besoin brut (sous-total)
                            { text: o.totalOutput2("car").toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },

                            {},

                            // Besoin net (sous-total)
                            { text: o.totalNetOutput2("car").toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },

                            // Besoin net réduit (sous-total)
                            { text: o.totalReducedOutput2("car").toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },

                            // Places à réaliser (sous-total)
                            { text: o.totalReducedOutput2("car").toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },
                        ],

                    ]
                    )
                    .flat(1)
            }}
        </div>
        -->

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