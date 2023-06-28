<template>
    <!-- 3. NET PARKING NEEDS -->
    <div class="q-pa-md">
        <div class="text-h5">Étape 5: Résumé</div>

        <div class="row">
            <div class="q-pa-md q-ma-none col-xs-8 col-sm-8 col-md-8">
                <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders">

                    <table>
                        <tr>
                            <th>Affectation</th>
                            <th>Min.</th>
                            <th>Max.</th>
                        </tr>

                        <tr v-for="(affectation, index) in this.project.affectations.filter(e => e.active)" :key="index">
                            <td>{{ affectation.name }}</td>
                            <td class="bg-light-blue-1">{{ affectation.totalNeed.min.toFixed(2) }}</td>
                            <td class="bg-light-blue-1">{{ affectation.totalNeed.max.toFixed(2) }}</td>
                        </tr>

                        <tr>
                            <td class="text-weight-bold">Total</td>
                            <td class="bg-light-blue-1 text-weight-bold">{{ this.project.totalNeed.min.toFixed(2) }}</td>
                            <td class="bg-light-blue-1 text-weight-bold">{{ this.project.totalNeed.max.toFixed(2) }}</td>
                        </tr>

                    </table>

                </div>
                <q-btn id="print-btn" color="white" text-color="black" icon="print" label="Imprimer la déclaration"
                    @click="print" />
            </div>

        </div>

    </div>
</template>

<script>

export default {
    name: 'FormE',
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
        print() {
            window.print()
        }
    }
}
</script>

<style scoped>
@import '../assets/table.css';
</style>