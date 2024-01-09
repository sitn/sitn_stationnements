<template>
    <!-- 3. NET PARKING NEEDS -->
    <div class="q-pa-md">

        <q-banner inline-actions class="text-white bg-red q-my-md q-pa-md rounded-borders" v-if="!this.render">
            <template v-slot:avatar>
                <q-icon name="error" color="white" />
            </template>
            <span class="text-body1">Veuillez compléter l'étape précédente</span>
        </q-banner>

        <!-- <div>{{ this.outputs }}</div><br> -->

        <!-- INFOBOX -->
        <q-card flat class="bg-grey-1 q-pa-md q-my-md infobox" v-if="this.render">

            <q-card-section horizontal>

                <!-- 
                    <q-card-actions vertical class="justify-around q-pa-xs">
                    <q-icon name="info" color="orange-5" size="3em" />
                    </q-card-actions>
                -->

                <q-card-section class="q-pa-xs">
                    <div class="text-body2 text-weight-bold q-mb-sm">Informations sur le calcul</div>

                    <div class="text-body2">
                        <ul>
                            <li>Le besoin net en places de stationnement est calculé par l’application au besoin brut des
                                pourcentages du tableau 2 de l’annexe 1 du RELConstr.</li>

                            <li>Les pourcentages sont à appliquer dans les cases ci-dessous (affectation logement et
                                affectation activité). Ils sont compris entre un minimum et un maximum.</li>

                            <li>La commune peut définir un pourcentage fixe dans son plan règlement communal, ou le canton
                                dans un plan d’affectation cantonal.</li>

                            <li>Le pourcentage à appliquer au besoin brut pour les quartiers durables est obligatoirement le
                                minimum, sauf pour l’affectation logement dans le type de localisation III où il est de 50%
                                (au lieu de 70%).</li>
                        </ul>
                    </div>
                </q-card-section>

            </q-card-section>

        </q-card>

        <!-- FORM -->
        <q-form ref="form" greedy no-error-focus no-reset-focus v-if="this.render">

            <!-- Eco neighbourhoud checkbox field -->
            <div class="row q-pa-sm q-my-sm bg-grey-2 rounded-borders">
                <q-item tag="label" v-ripple>
                    <q-item-section avatar>
                        <q-checkbox v-model="this.project.eco" @update:model-value="eco()" color="blue" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>Le projet est un quartier durable au sens de l’article 48 de la loi cantonale sur l’aménagement du territoire.</q-item-label>
                        <q-item-label caption>Le pourcentage à appliquer au besoin brut pour les quartiers durables est obligatoirement le minimum, sauf pour l’affectation logement dans le type de localisation III où il est de 50% (au lieu de 70%).</q-item-label>
                    </q-item-section>
                </q-item>
            </div>

            <!-- <div>{{ this.project.commune }}</div> -->

            <!-- Housing and activity ratios input fields -->
            <div class="row q-col-gutter-none q-pa-sm q-my-sm bg-grey-2 rounded-borders">

                <div class="col-xs-12 col-sm-6 q-pa-sm q-my-none" v-for="(item, key) in this.outputs.values">
                    <q-input bg-color="white" outlined label="" type="number" name="" v-model.number="item.effective" :min=item.min :max=item.max @update:model-value="check(item)" reactive-rules :rules="[val => validateRange(val, item.min, item.max)]" :disable="!this.project.affectations.filter((x) => (x.active)).map((x) => (x.type)).includes(item.label) || this.project.eco">
                        <template v-slot:label>
                            {{ item.label }} {{ this.project.eco === true ? `` : `(${item.min}% à ${item.max}% selon votre projet)` }}
                        </template>
                        <template v-slot:append>
                            <div class="text-body2">%</div>
                        </template>
                    </q-input>
                </div>

            </div>

        </q-form>

        <!-- COMPUTATION SUMMARY TABLES -->
        <div class="row" v-if="this.render">

            <!-- CAR PARKINGS SUMMARY TABLE -->
            <div id="summary-container" class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table id="summary-table">
                        <caption class="text-subtitle1">Stationnements voitures</caption>
                        <thead>
                            <tr>
                                <th>Affectation</th>
                                <th>Facteur</th>
                                <th>Type de place</th>
                                <!-- <th class="text-right"><q-icon name="directions_car" size="sm" /></th> -->
                                <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="directions_car" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="item in this.project.affectations.filter(e => e.active)">
                                <tr v-for="(subitem, iSub) in item.netOutput2.filter(e => e.group === 'car')">
                                    <td v-if="iSub === 0" :rowspan="item.outputs.filter(e => e.group === 'car').length" class="">{{ item.name }}</td>
                                    <td v-if="iSub === 0" :rowspan="item.outputs.filter(e => e.group === 'car').length" class="">&#215; {{ item.ordinaryReduction.toFixed(1) }}% </td>
                                    <td>{{ subitem.name }}</td>
                                    <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(3) }}</td>
                                    <!-- <td class="bg-light-blue-1 text-right">{{ Math.ceil(subitem.value) }}</td> -->
                                </tr>
                            </template>
                            <tr>
                                <td class="text-weight-bold">Besoin net total</td>
                                <td class="text-weight-bold"></td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ this.project.getNetNeeds('car').toFixed(3) }}
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

                    <table id="summary-table">
                        <caption class="text-subtitle1">Stationnements vélos (y.c. électriques &lt; 1kW)</caption>
                        <thead>
                            <tr>
                                <th>Affectation</th>
                                <th>Facteur</th>
                                <th>Type de place</th>
                                <!-- <th class="text-right"><q-icon name="directions_car" size="sm" /></th> -->
                                <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="directions_bike" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="item in this.project.affectations.filter(e => e.active)">
                                <tr v-for="(subitem, iSub) in item.netOutput2.filter(e => e.group === 'bicycle')">
                                    <td v-if="iSub === 0" :rowspan="item.outputs.filter(e => e.group === 'bicycle').length" class="">{{ item.name }}</td>
                                    <td v-if="iSub === 0" :rowspan="item.outputs.filter(e => e.group === 'bicycle').length" class="">Non applicable</td> <!--&#215; {{ 100.0 }}%  -->
                                    <td>{{ subitem.name }}</td>
                                    <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(3) }}</td>
                                    <!-- <td class="bg-light-blue-1 text-right">{{ Math.ceil(subitem.value) }}</td> -->
                                </tr>
                            </template>
                            <tr>
                                <td class="text-weight-bold">Besoin net total</td>
                                <td class="text-weight-bold"></td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ this.project.getNetNeeds('bicycle').toFixed(3) }}

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
            <div id="summary-container" class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table id="summary-table">
                        <caption class="text-subtitle1">Stationnements deux-roues motorisés</caption>
                        <thead>
                            <tr>
                                <th>Affectation</th>
                                <th>Facteur</th>
                                <th>Type de place</th>
                                <!-- <th class="text-right"><q-icon name="directions_car" size="sm" /></th> -->
                                <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="motorcycle" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="item in this.project.affectations.filter(e => e.active)">
                                <tr v-for="(subitem, iSub) in item.netOutput2.filter(e => e.group === 'motorcycle')">
                                    <td v-if="iSub === 0" :rowspan="item.outputs.filter(e => e.group === 'motorcycle').length" class="">{{ item.name }}</td>
                                    <td v-if="iSub === 0" :rowspan="item.outputs.filter(e => e.group === 'motorcycle').length" class="">&#215; {{ item.ordinaryReduction.toFixed(1) }}%</td>
                                    <td>{{ subitem.name }}</td>
                                    <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(3) }}</td>
                                    <!-- <td class="bg-light-blue-1 text-right">{{ Math.ceil(subitem.value) }}</td> -->
                                </tr>
                            </template>
                            <tr>
                                <td class="text-weight-bold">Besoin net total</td>
                                <td class="text-weight-bold"></td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ this.project.getNetNeeds('motorcycle').toFixed(3) }}
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

                    <table id="summary-table">
                        <caption class="text-subtitle1">Équipements pour véhicules électriques</caption>
                        <thead>
                            <tr>
                                <th>Affectation</th>
                                <th>Facteur</th>
                                <th>Type d'équipement</th>
                                <!-- <th class="text-right"><q-icon name="directions_car" size="sm" /></th> -->
                                <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="ev_station" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="item in this.project.affectations.filter(e => e.active)">
                                <tr v-for="(subitem, iSub) in item.netOutput2.filter(e => e.group === 'station')">
                                    <td v-if="iSub === 0" :rowspan="item.outputs.filter(e => e.group === 'station').length" class="">{{ item.name }}</td>
                                    <td v-if="iSub === 0" :rowspan="item.outputs.filter(e => e.group === 'station').length" class="">&#215; {{ item.ordinaryReduction.toFixed(1) }}%</td>
                                    <td>{{ subitem.name }}</td>
                                    <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(3) }}</td>
                                    <!-- <td class="bg-light-blue-1 text-right">{{ Math.ceil(subitem.value) }}</td> -->
                                </tr>
                            </template>
                            <tr>
                                <td class="text-weight-bold">Besoin net total</td>
                                <td class="text-weight-bold"></td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ this.project.getNetNeeds('station').toFixed(3) }}
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

    </div>
</template>

<script>
import { store } from '../store/store.js'

export default {
    name: 'FormC',
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
            range: null,
        }
    },
    computed: {
        render() {
            return (this.project.commune !== null) & (this.project.locationType !== null) & this.project.hasAffectation
        },
        outputs() {

            // console.log(`FormC.vue: outputs`)

            if (this.project.commune === null || this.project.locationType === null) {
                return null // "Commune and/or zone not selected"
            } else {
                return this.project.commune.factors.find((e) => e.zone === this.project.locationType.name)
            }

        },

    },
    methods: {
        eco() {

            // console.log(`Eco: ${this.project.eco}`)
            if (this.project.eco) {

                this.outputs.values.map((x) => (x.effective = x.min))
                if (this.outputs.zone === "III") {
                    this.outputs.values.find((x) => (x.type === "housing")).effective = 50
                }
                this.updateLocationFactors()
            }

        },
        updateLocationFactors() {

            // update outputs in affectations
            this.project.affectations.forEach((e) => {

                let item = e.variables.find((x) => x.type === 'reduction')

                if (e.type === "Logement") {

                    item.value = this.outputs.values.find((x) => x.type === "housing").effective

                }

                if (e.type === "Activité") {

                    item.value = this.outputs.values.find((x) => x.type === "activity").effective

                }

            })

        },
        validateRange(val, min, max) {
            let isValid = val !== null && val !== '' && val >= min && val <= max
            if (isValid === false) {
                val = null
            }
            let msg
            if (max === Infinity) {
                msg = `Veuillez entrer une valeur supérieure à ${min}`
            } else {
                msg = `Veuillez entrer une valeur entre ${min} et ${max}`
            }
            return isValid || `Veuillez entrer une valeur entre ${min} et ${max} selon votre projet`
        },
        check(item) {

            // console.log(item)
            let isValid = item.effective >= item.min && item.effective <= item.max
            if (!isValid) {
                item.effective = null
            } else {
                item.effective = item.effective
            }
            this.updateLocationFactors()

        },
        validateForm() {
            if (this.$refs.hasOwnProperty('form')) {
                if (this.$refs.form !== null) {
                    this.$nextTick(() => { this.$refs.form.validate() })
                }
            }
        }
    },
    mounted() {

        // this.$nextTick(() => { this.$refs.form.validate() })

    },
    updated() {

        // console.log('this.$refs')
        // console.log(this.$refs)
        // console.log(`form !== null:  ${this.$refs.form !== null}`)
        // console.log(`form hasOwnProperty:  ${this.$refs.hasOwnProperty('form')}`)

        if (this.$refs.hasOwnProperty('form')) {
            if (this.$refs.form !== null) {
                this.$nextTick(() => { this.$refs.form.validate() })
            }
        }
    }
}
</script>

<style scoped>
@import '../assets/styles/table.css';
</style>