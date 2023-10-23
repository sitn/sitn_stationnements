<template>
    <!-- 3. NET PARKING NEEDS -->
    <div class="q-pa-md">

        <q-banner inline-actions class="text-white bg-red q-my-md q-pa-md rounded-borders" v-if="!this.render">
            <template v-slot:avatar>
                <q-icon name="error" color="white" />
            </template>
            <span class="text-body1">Veuillez compléter l'étape précédente</span>
        </q-banner>

        <!-- <div>{{ this.factors }}</div><br> -->

        <!-- INFOBOX  -->
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

        <q-form ref="form" greedy v-if="this.render">

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

            <!-- Housing and activity ratios input fields -->
            <div class="row q-col-gutter-none q-pa-sm q-my-sm bg-grey-2 rounded-borders">
                <div class="col-xs-12 col-sm-6 q-pa-sm q-my-none" v-for="(item, key) in this.factors.values">
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

            <!-- Net needs tables  -->
            <div class="row">
                <div class="q-pa-md q-ma-none col-xs-12 col-sm-6 col-md-6" v-for="(item, key) in this.project.affectations.filter(e => e.active)">
                    <div class="bg-white q-pa-md q-my-sm rounded-borders">

                        <table>

                            <tr>
                                <th>{{ item.name }}</th>
                                <th class="text-right"> &#215; {{ item.ordinaryReduction.toFixed(1) }}%</th>
                            </tr>

                            <tr v-for="(item3, key3) in item.factors">
                                <td> {{ item3.name }}</td>
                                <td class="bg-light-blue-1 text-right">
                                    {{ item.netOutput[key3].toFixed(2) }}</td>
                            </tr>

                            <tr>
                                <td class="text-weight-bold">Besoin net total</td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ item.totalNetOutput.toFixed(2) }}
                                </td>

                            </tr>

                        </table>

                    </div>

                </div>

            </div>

        </q-form>

    </div>
</template>

<script>

export default {
    name: 'FormC',
    components: {},
    props: { 'project': Object },
    emits: [],
    setup() {
        return {
        }
    },
    data() {
        return {
            range: null,
        }
    },
    computed: {
        render() {
            return (this.project.commune !== null) & (this.project.locationType !== null) & this.project.hasAffectation
        },
        factors() {

            // console.log(`FormC.vue: factors`)
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

                this.factors.values.map((x) => (x.effective = x.min))
                if (this.factors.zone === "III") {
                    this.factors.values.find((x) => (x.type === "housing")).effective = 50
                }
                this.updateLocationFactors()
            }

        },
        updateLocationFactors() {

            // update factors in affectations
            this.project.affectations.forEach((e) => {

                let item = e.variables.find((x) => x.type === 'reduction')

                if (e.type === "Logement") {

                    item.value = this.factors.values.find((x) => x.type === "housing").effective

                }

                if (e.type === "Activité") {

                    item.value = this.factors.values.find((x) => x.type === "activity").effective

                }

            })

        },
        validateRange(val, min, max) {
            let isValid = val !== null && val >= min && val <= max
            if (isValid === false) {
                val = null
            }

            if (max === Infinity) {
                let msg = `Veuillez entrer une valeur supérieure à ${min}`
            } else {
                let msg = `Veuillez entrer une valeur entre ${min} et ${max}`
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