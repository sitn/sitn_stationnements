<template>
    <!-- 3. NET PARKING NEEDS -->
    <div class="q-px-md">

        <q-banner inline-actions class="text-white bg-red q-my-md q-pa-md rounded-borders" v-if="!this.render">
            <template v-slot:avatar>
                <q-icon name="error" color="white" />
            </template>
            <span class="text-body1">Veuillez compléter l'étape précédente</span>
        </q-banner>

        <div v-if="this.render">

            <!-- INFOBOX -->
            <q-list class="q-my-md">
                <q-expansion-item class="bg-grey-1">
                    <template v-slot:header>
                        <q-item-section avatar>
                            <q-icon name="help" color="orange-7" size="2rem" />
                        </q-item-section>

                        <q-item-section>
                            <div class="text-body2 text-weight-bold">Informations et aide sur le calcul</div>
                            <div class="text-caption">Cliquer pour ouvrir/fermer</div>
                        </q-item-section>

                        <q-item-section side>

                        </q-item-section>
                    </template>

                    <q-card flat class="q-pa-none">

                        <q-card-section class="">

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

                    </q-card>

                </q-expansion-item>
            </q-list>

            <!-- FORM -->
            <q-form ref="formC" greedy no-error-focus no-reset-focus @validation-success="validationSuccess" @validation-error="validationError">

                <!-- Eco neighbourhoud checkbox field -->
                <div class="row q-pa-sm q-my-md bg-grey-1 rounded-borders">
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

                <!-- Housing and activity ratios input fields -->
                <div class="row q-col-gutter-none q-pa-sm q-my-sm bg-grey-1 rounded-borders">

                    <div class="col-xs-12 col-sm-6 q-pa-sm q-my-none" v-for="(item, key) in this.outputs.values">
                        <q-input bg-color="white" outlined label="" type="number" name="" v-model.number="item.effective" :min=item.min :max=item.max @update:model-value="check(item)" reactive-rules :rules="[val => validateRange(val, item.min, item.max)]" :disable="!this.project.getAffectations().map((x) => (x.type)).includes(item.label) || this.project.eco">
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
            <div class="row">

                <!-- CAR PARKINGS SUMMARY TABLE -->
                <div id="summary-container" class="col-xs-12 col-sm-12 col-md-12 col-lg-8">
                    <div class="bg-white q-pa-md q-my-sm rounded-borders">

                        <table class="total-row">
                            <caption class="text-subtitle1">Stationnements voitures</caption>
                            <thead>
                                <tr>
                                    <th>Affectation</th>
                                    <th>Facteur</th>
                                    <th>Type de place</th>
                                    <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="directions_car" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-for="item in this.project.getAffectations()">
                                    <tr v-for="(subitem, iSub) in item.getNetOutputs(['car'])">
                                        <td v-if="iSub === 0" :rowspan="item.getOutputs(['car']).length" class="">{{ item.name }}</td>
                                        <td v-if="iSub === 0" :rowspan="item.getOutputs(['car']).length" class="">&#215; {{ item.ordinaryReduction.toFixed(1) }}% </td>
                                        <td>{{ subitem.name }}</td>
                                        <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(2) }}</td>
                                    </tr>
                                </template>
                                <tr>
                                    <td class="text-weight-bold">Besoin net total</td>
                                    <td class="text-weight-bold"></td>
                                    <td class="text-weight-bold"></td>
                                    <td class="bg-light-blue-1 text-weight-bold text-right">
                                        {{ this.project.getNetNeeds(['car']).toFixed(2) }}
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
    name: 'FormC',
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
            range: null,
        }
    },
    computed: {
        render() {
            return store.validity.A & store.validity.B
            // return (this.project.commune !== null) & (this.project.locationType !== null) & this.project.hasAffectation
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
            if (this.$refs.hasOwnProperty('formC')) {
                if (this.$refs.formC !== null) {
                    this.$nextTick(() => { this.$refs.formC.validate() })
                }
            }
        },
        validationSuccess() {
            // console.log(`${this.$options.name} | validationSuccess()`)
            this.store.validity.C = true
            // console.log(this.store.validity)
            //this.valid = true
            //this.model.valid = true
            //store.valid = true
            //this.$emit('validationEvent', true)
        },
        validationError() {
            // console.log(`${this.$options.name} | validationError()`)
            this.store.validity.C = false
            // console.log(this.store.validity)
            //this.valid = false
            //this.model.valid = false
            //store.valid = false
            //this.$emit('validationEvent', false)
        },

    },
    updated() {

        this.validateForm()
    }
}
</script>

<style scoped>
@import '../assets/styles/table.css';
</style>