<template>
    <!-- 3. NET PARKING NEEDS -->
    <div class="q-pa-md">
        <!-- <div class="text-h5">3: Calcul du besoin net (article 28 RELConstr.)</div> -->

        <q-banner inline-actions class="text-white bg-red q-my-md q-pa-md rounded-borders"
            v-if="!this.project.hasAffectation">
            <template v-slot:avatar>
                <q-icon name="error" color="white" />
            </template>
            <span class="text-body1">Veuillez compléter l'étape précédente</span>
        </q-banner>

        <div>{{ this.factors }}</div>

        <!-- Factor -->
        <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders" v-for="(item, key) in this.factors.values">

            <q-input class="col" bg-color="white" outlined label="" type="number" name="" v-model="item.effective"
                :min=item.min :max=item.max
                :rules="[(val) => validateRange(val) || 'Seuls les chiffres sans espaces sont admis']">
                <template v-slot:label>
                    {{ item.label }}
                </template>
                <template v-slot:hint>
                    Entrer un pourcentage entre {{ item.min * 100 }} et {{ item.max * 100 }}% (Localisation de type {{
                        this.factors.zone }})
                </template>
            </q-input>

        </div>


        <!-- 
        <div>{{ project.commune.factors.find((e) => e.zone === project.locationType.name) }}</div>
        <div>{{ project.commune.factors.find((e) => e.zone === project.locationType.name).values }}</div>
        <div>{{ project.commune.factors.find((e) => e.zone === project.locationType.name).values.find((e) => e.type ===
            "housing") }}</div>
        -->

        <div v-if="this.project.hasAffectation" class="row">
            <div class="q-pa-md q-ma-none col-xs-12 col-sm-6 col-md-6"
                v-for="(item, key) in this.project.affectations.filter(e => e.valid)">
                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table>
                        <tr>
                            <th>{{ item.name }}</th>
                            <th class="text-right">Min. {{ 100 * item.range.min }}%</th>
                            <th class="text-right">Max. {{ 100 * item.range.max }}%</th>
                        </tr>
                        <tr>
                            <td> {{ item.type == "Logement" ? "Besoin net habitant" : "Besoin net employé" }}</td>
                            <td class="bg-light-blue-1 text-right">{{
                                item.netResidentNeed.min.toFixed(2) }}</td>
                            <td class="bg-light-blue-1 text-right">{{
                                item.netResidentNeed.max.toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td>{{ item.type == "Logement" ? "Besoin net visiteur" : "Besoin net client" }}</td>
                            <td class="bg-light-blue-1 text-right">{{
                                item.netVisitorNeed.min.toFixed(2) }}</td>
                            <td class="bg-light-blue-1 text-right">{{
                                item.netVisitorNeed.max.toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td class="text-weight-bold">Besoin net total</td>
                            <td class="bg-light-blue-1 text-weight-bold text-right">{{
                                (item.netResidentNeed.min +
                                    item.netVisitorNeed.min).toFixed(2)
                            }}</td>
                            <td class="bg-light-blue-1 text-weight-bold text-right">{{
                                (item.netResidentNeed.max +
                                    item.netVisitorNeed.max).toFixed(2)
                            }}</td>
                        </tr>
                    </table>

                </div>

            </div>

        </div>

    </div>
</template>

<script>
// import { isNullOrUndefined } from 'pdfmake/build/pdfmake';
// import { ref } from 'vue'

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
                return "Commune not selected"
            } else {
                console.log(this.project.commune.factors.find((e) => e.zone === this.project.locationType.name))
                return this.project.commune.factors.find((e) => e.zone === this.project.locationType.name)
            }

        }

    },
    methods: {

        validateRange(val) {
            return val >= 0.0 && val <= 1.0
        },

    },
    mounted() {
        console.log(`the component is now mounted.`)
        console.log(this.project)
    }
}
</script>

<style scoped>
@import '../assets/table.css';
</style>