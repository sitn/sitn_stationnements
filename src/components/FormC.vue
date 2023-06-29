<template>
    <!-- 3. NET PARKING NEEDS -->
    <div class="q-pa-md">
        <div class="text-h5">Étape 3: Calcul du besoin net</div>
        <div class="row">
            <div class="q-pa-md q-ma-none col-xs-12 col-sm-6 col-md-4"
                v-for="(item, key) in this.project.affectations.filter(e => e.active)">
                <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders">

                    <table>
                        <tr>
                            <th>{{ item.name }}</th>
                            <th v-if="item.hasRange">Min. {{ 100 * item.range.min }}%</th>
                            <th v-if="item.hasRange">Max. {{ 100 * item.range.max }}%</th>
                            <th v-if="!item.hasRange">Fixe {{ 100 * item.range.max }}%</th>
                        </tr>
                        <tr>
                            <td> {{ item.type == "Logement" ? "Besoin net habitant" : "Besoin net employé" }}</td>
                            <td v-if="item.hasRange" class="bg-light-blue-1">{{ item.netResidentNeed.min.toFixed(2) }}</td>
                            <td v-if="item.hasRange" class="bg-light-blue-1">{{ item.netResidentNeed.max.toFixed(2) }}</td>
                            <td v-if="!item.hasRange" class="bg-light-blue-1">{{ item.netResidentNeed.max.toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td>{{ item.type == "Logement" ? "Besoin net visiteur" : "Besoin net client" }}</td>
                            <td v-if="item.hasRange" class="bg-light-blue-1">{{ item.netVisitorNeed.min.toFixed(2) }}</td>
                            <td v-if="item.hasRange" class="bg-light-blue-1">{{ item.netVisitorNeed.max.toFixed(2) }}</td>
                            <td v-if="!item.hasRange" class="bg-light-blue-1">{{ item.netVisitorNeed.max.toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td class="text-weight-bold">Besoin net total</td>
                            <td v-if="item.hasRange" class="bg-light-blue-1 text-weight-bold">{{ (item.netResidentNeed.min +
                                item.netVisitorNeed.min).toFixed(2)
                            }}</td>
                            <td v-if="item.hasRange" class="bg-light-blue-1 text-weight-bold">{{ (item.netResidentNeed.max +
                                item.netVisitorNeed.max).toFixed(2)
                            }}</td>
                            <td v-if="!item.hasRange" class="bg-light-blue-1 text-weight-bold">{{ (item.netResidentNeed.max
                                + item.netVisitorNeed.max).toFixed(2)
                            }}</td>
                        </tr>
                    </table>

                </div>

            </div>

        </div>

    </div>
</template>

<script>
import { ref } from 'vue'

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
        }
    },
    computed: {

    },
    methods: {

    }
}
</script>

<style scoped>
@import '../assets/table.css';
</style>