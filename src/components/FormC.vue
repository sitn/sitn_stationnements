<template>
    <!-- 3. NET PARKING NEEDS -->
    <div class="q-pa-md">

        <q-banner inline-actions class="text-white bg-red q-my-md q-pa-md rounded-borders"
            v-if="!this.project.hasAffectation">
            <template v-slot:avatar>
                <q-icon name="error" color="white" />
            </template>
            <span class="text-body1">Veuillez compléter l'étape précédente</span>
        </q-banner>

        <div>{{ this.factors }}</div><br>

        <q-form ref="form" greedy>

            <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders" v-for="(item, key) in this.factors.values">

                <q-input class="col" bg-color="white" outlined label="" type="number" name=""
                    v-model.number="item.effective" :min=item.min :max=item.max
                    :rules="[val => validateRange(val, item.min, item.max)]">
                    <!-- :hint="`${item.min} ≥ x ≤ ${item.max}`" -->
                    <template v-slot:label>
                        {{ item.label }}
                    </template>
                    <!-- 
                    <template v-slot:hint>
                        Entrer un pourcentage entre {{ item.min * 100 }} et {{ item.max * 100 }}% (Localisation de type {{
                            this.factors.zone }})
                    </template>
                    -->
                </q-input>

            </div>


            <div class="row">
                <div class="q-pa-md q-ma-none col-xs-12 col-sm-6 col-md-6"
                    v-for="(item, key) in this.project.affectations.filter(e => e.active)">
                    <div class="bg-white q-pa-md q-my-sm rounded-borders">

                        <table>

                            <tr>
                                <th>{{ item.name }}</th>
                                <th class="text-right"> x {{ item.ordinaryReduction }}</th>
                            </tr>

                            <tr v-for="(item3, key3) in item.factors">
                                <td> {{ item3.name }}</td>
                                <td class="bg-light-blue-1 text-right">
                                    {{ item.netOutput[key3] }}</td>
                            </tr>

                            <tr>
                                <td class="text-weight-bold">Besoin net total</td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    Mytotal
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
        factors() {

            if (this.project.commune === null || this.project.locationType === null) {
                return "Commune and/or zone not selected"
            } else {

                // this.project.affectations.map(x => x.reductions)

                let locationFactors = this.project.commune.factors.find((e) => e.zone === this.project.locationType.name)

                this.project.affectations.forEach(function (e) {

                    let item = e.variables.find((x) => x.type === 'reduction')

                    if (e.type === "Logement") {

                        item.value = locationFactors.values.find((x) => x.type === "housing").effective

                    }

                    if (e.type === "Activité") {

                        item.value = locationFactors.values.find((x) => x.type === "activity").effective

                    }

                })

                // console.log('locationFactors')
                // console.log(locationFactors)

                return locationFactors
            }

        }

    },
    methods: {

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
            return isValid || `Veuillez entrer une valeur entre ${min} et ${max}`
        },

    },
    mounted() {
        this.$nextTick(() => { this.$refs.form.validate() })
    }
}
</script>

<style scoped>
@import '../assets/table.css';
</style>