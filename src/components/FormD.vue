<template>
    <!-- 4. REDUCED PARKING NEEDS -->
    <div class="q-pa-md">
        <!-- <div class="text-h5">4. Calcul du besoin net réduit (article 29 RELConstr.)</div> -->

        <q-banner inline-actions class="text-white bg-red q-my-md q-pa-md rounded-borders"
            v-if="!this.project.hasAffectation">
            <template v-slot:avatar>
                <q-icon name="error" color="white" />
            </template>
            <span class="text-body1">Veuillez compléter l'étape précédente</span>
        </q-banner>

        <!-- LOCATION TYPE INFOBOX  -->
        <div v-if="this.project.hasAffectation"> 
            <q-card flat class="bg-grey-1 q-pa-md q-my-md infobox">

                <q-card-section horizontal>

                    <q-card-actions vertical class="justify-around q-pa-xs">
                        <q-icon name="info" color="orange-5" size="3em" />
                    </q-card-actions>

                    <q-card-section class="q-pa-xs">
                        <div class="text-body1 text-weight-bold">Facteurs de réduction</div>

                        <div class="text-body1 q-pa-none">
                            <ul>
                                <li>Des facteurs de réduction peuvent être appliqués au besoin net,
                                    par le réquérant ou par la commune (articles 31 à 34 du
                                    RELConstr.). Les facteurs de réduction sont à porter en déduction
                                    du besoin net. Le résultat obtenu se nomme le besoin net réduit.</li>

                                <li>Les facteurs de réduction peuvent intervenir lors de l'examen du
                                    dossier par la commune ou les services compétents, notamment en ce
                                    qui concerne la législation sur l'environnement et la sauvegarde
                                    du patrimoine.</li>

                                <li>Pour les logements avec encadrements ou étudiants,
                                    il convient de prendre contact en amont avec la commune pour
                                    déterminer si un facteur de réduction s'applique.</li>
                            </ul>
                        </div>
                    </q-card-section>

                </q-card-section>

            </q-card>

            <div class="text-h6">Liste des réductions</div>
            <div class="row">
                <div class="q-py-sm q-ma-none col-xs-12 col-sm-12 col-md-12"
                    v-for="(affectation, key) in this.project.affectations.filter(e => e.active && e.reductions.length > 0)">

                    <div class="bg-white q-pa-md q-my-none rounded-borders">

                        <table>

                            <tr>
                                <th>{{ affectation.name }}</th>
                                <th style="white-space: nowrap;">Réduction (%)</th>
                            </tr>
                            <tr v-for="(reduction, index) in affectation.reductions" :key="index">
                                <td>{{ reduction.description }}</td>
                                <td>
                                    <q-input dense bg-color="white" outlined type="number" name="reduction.factor"
                                        v-model.number="reduction.factor" min="0.0" max="100">
                                        <template v-slot:append>
                                            <div class="text-body2">%</div>
                                        </template>
                                    </q-input>
                                </td>
                            </tr>
                            <tr>
                                <td class="text-weight-bold">Total</td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">{{ (affectation.totalReduction *
                                    100).toFixed(1) }}
                                    %</td>
                            </tr>

                        </table>

                    </div>

                </div>

            </div>

            <q-separator class="q-my-md" />

            <div class="text-h6">Besoin net réduit</div>
            <div class="row">
                <div class="q-pa-md q-ma-none col-xs-12 col-sm-6 col-md-6"
                    v-for="(item, key) in this.project.affectations.filter(e => e.active)">
                    <div class="bg-white q-pa-md q-my-none rounded-borders">

                        <table>
                            <tr>
                                <th>{{ item.name }}</th>
                                <th v-if="item.hasRange" class="text-right">Min.</th>
                                <th v-if="item.hasRange" class="text-right">Max.</th>
                                <th v-if="!item.hasRange" class="text-right">Fixe</th>
                            </tr>

                            <tr>
                                <td> {{ item.type == "Logement" ? "Besoin net réduit habitant" : "Besoin net réduit employé"
                                }}
                                </td>
                                <td v-if="item.hasRange" class="bg-light-blue-1 text-right">{{
                                    item.reducedNetResidentNeed.min.toFixed(2)
                                }}</td>
                                <td v-if="item.hasRange" class="bg-light-blue-1 text-right">{{
                                    item.reducedNetResidentNeed.max.toFixed(2)
                                }}</td>
                                <td v-if="!item.hasRange" class="bg-light-blue-1 text-right">{{
                                    item.reducedNetResidentNeed.max.toFixed(2)
                                }}</td>
                            </tr>
                            <tr>
                                <td>{{ item.type == "Logement" ? "Besoin net réduit visiteur" : "Besoin net réduit client"
                                }}
                                </td>
                                <td v-if="item.hasRange" class="bg-light-blue-1 text-right">{{
                                    item.reducedNetVisitorNeed.min.toFixed(2) }}
                                </td>
                                <td v-if="item.hasRange" class="bg-light-blue-1 text-right">{{
                                    item.reducedNetVisitorNeed.max.toFixed(2) }}
                                </td>
                                <td v-if="!item.hasRange" class="bg-light-blue-1 text-right">{{
                                    item.reducedNetVisitorNeed.max.toFixed(2)
                                }}</td>
                            </tr>
                            <tr>
                                <td class="text-weight-bold">Besoin net réduit total</td>
                                <td v-if="item.hasRange" class="bg-light-blue-1 text-weight-bold text-right">{{
                                    item.totalNeed.min.toFixed(2) }}</td>
                                <td v-if="item.hasRange" class="bg-light-blue-1 text-weight-bold text-right">{{
                                    item.totalNeed.max.toFixed(2) }}</td>
                                <td v-if="!item.hasRange" class="bg-light-blue-1 text-right">{{
                                    item.totalNeed.max.toFixed(2) }}
                                </td>
                            </tr>
                        </table>

                    </div>

                </div>

            </div>

        </div>
    </div>
</template>

<script>

export default {
    name: 'FormD',
    components: {},
    props: { 'project': Object },
    emits: [],
    setup() {
        return {
        }
    },
    data() {
        return {
        }
    },
    computed: {

    },
    methods: {

    }
}
</script>

<style scoped>@import '../assets/table.css';</style>