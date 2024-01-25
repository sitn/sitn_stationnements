<template>
    <!-- 4. REDUCED PARKING NEEDS -->
    <div class="q-pa-md">

        <q-banner inline-actions class="text-white bg-red q-my-md q-pa-md rounded-borders" v-if="!this.render">
            <template v-slot:avatar>
                <q-icon name="error" color="white" />
            </template>
            <span class="text-body1">Veuillez compléter l'étape précédente</span>
        </q-banner>

        <div v-if="this.render">

            <!-- INFOBOX  -->
            <q-card flat class="bg-grey-1 q-pa-md q-my-md infobox">

                <q-card-section horizontal>

                    <q-card-section class="q-pa-xs">
                        <div class="text-body2 text-weight-bold">Informations sur le calcul</div>
                        <div class="text-body2 q-pa-none">
                            <ul>
                                <li>Le besoin net réduit est calculé par un ou des facteurs de réduction appliqués au besoin
                                    net.</li>
                                <li>Si le requérant fait usage d’un facteur de réduction, il joint à la demande de permis de
                                    construire une demande motivée démontrant la faisabilité du projet.</li>
                                <li>Un plan de mobilité peut justifier un facteur de réduction.</li>
                                <li>Un contact préalable avec la commune et/ou les services compétents peut être pertinent,
                                    notamment pour les projets avec des logements avec encadrement ou étudiants ou concernés
                                    par les thématiques de l’environnement (bruit, air) et de la sauvegarde du patrimoine.
                                </li>
                            </ul>
                        </div>
                    </q-card-section>
                </q-card-section>
            </q-card>

            <div class="text-h6">Liste des facteurs de réduction </div>
            <div class="row">
                <div class="q-py-sm q-ma-none col-xs-12 col-sm-12 col-md-12" v-for="(affectation, key) in this.project.affectations.filter(e => e.active && e.variables.filter((x) => x.type === 'special reduction').length > 0)">

                    <div class="bg-white q-pa-md q-my-none rounded-borders">

                        <table class="total-row">
                            <thead>
                                <tr>
                                    <th>{{ affectation.name }}</th>
                                    <th style="white-space: nowrap;">Réduction (-x%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(reduction, index) in affectation.variables.filter(e => e.type === 'special reduction')" :key="index">
                                    <td>
                                        <div class="text-weight-bold">{{ reduction.name }}</div>
                                        <div class="text-caption">{{ reduction.description }}</div>
                                    </td>
                                    <td width="20%">
                                        <q-input dense bg-color="white" outlined type="number" name="reduction.factor" v-model.number="reduction.value" :min=reduction.min :max=reduction.max @update:model-value="check(reduction)" reactive-rules :rules="[val => validateRange(val, reduction.min, reduction.max)]">
                                            <template v-slot:prepend>
                                                <div class="text-body2">-</div>
                                            </template>
                                            <template v-slot:append>
                                                <div class="text-body2">%</div>
                                            </template>
                                        </q-input>
                                    </td>
                                </tr>

                                <tr>
                                    <td class="text-weight-bold">Total</td>
                                    <td class="bg-light-blue-1 text-weight-bold text-right">{{
                                        (-affectation.specialReduction).toFixed(1) }}%</td>
                                </tr>
                            </tbody>
                        </table>

                    </div>

                </div>

            </div>

            <q-separator class="q-my-md" />

            <div class="text-h6">Besoin net réduit</div>

            <!-- COMPUTATION SUMMARY TABLES -->
            <div class="row" v-if="this.render">

                <!-- CAR PARKINGS SUMMARY TABLE -->
                <div id="summary-container" class="col-xs-12 col-sm-12 col-md-12 col-lg-8">
                    <div class="bg-white q-pa-md q-my-sm rounded-borders">

                        <table class="total-row">
                            <caption class="text-subtitle1">Stationnements voitures</caption>
                            <thead>
                                <tr>
                                    <th>Affectation</th>
                                    <th>Réduction</th>
                                    <th>Type de place</th>
                                    <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="directions_car" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-for="item in this.project.affectations.filter(e => e.active)">
                                    <tr v-for="(subitem, iSub) in item.getReducedOutputs('car')">
                                        <td v-if="iSub === 0" :rowspan="item.getOutputs('car').length" class="">{{ item.name }}</td>
                                        <td v-if="iSub === 0" :rowspan="item.getOutputs('car').length" class="">{{ (-item.specialReduction).toFixed(1) }}% </td>
                                        <td>{{ subitem.name }}</td>
                                        <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(3) }}</td>
                                    </tr>
                                </template>
                                <tr>
                                    <td class="text-weight-bold">Besoin net réduit total</td>
                                    <td class="text-weight-bold"></td>
                                    <td class="text-weight-bold"></td>
                                    <td class="bg-light-blue-1 text-weight-bold text-right">
                                        {{ this.project.getReducedNeeds('car').toFixed(3) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>

            </div>

        </div>
    </div>
</template>

<script>
import { store } from '../store/store.js'

export default {
    name: 'FormD',
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
            return (this.project.commune !== null) & (this.project.locationType !== null) & this.project.hasAffectation
        },
    },
    methods: {
        check(item) {

            let isValid = item.value >= item.min && item.value <= item.max
            if (!isValid) {
                item.value = null
            } else {
                item.value = item.value
            }

        },
        validateRange(val, min, max) {
            let isValid = val !== null && val >= min && val <= max
            if (isValid === false) {
                val = null
            }
            return isValid || `Veuillez entrer une valeur entre ${min} et ${max}`
        },
    }
}
</script>

<style scoped>
@import '../assets/styles/table.css';
</style>