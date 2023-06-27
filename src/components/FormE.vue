<template>
    <!-- 3. NET PARKING NEEDS -->
    <div class="q-pa-md">
        <div class="text-h5">Étape 5: Résumé</div>

        <div class="row">
            <div class="q-pa-md q-ma-none col-xs-12 col-sm-6 col-md-4">
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
                            <td class="bg-light-blue-1"></td>
                            <td class="bg-light-blue-1"></td>
                        </tr>

                    </table>

                </div>

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

    }
}
</script>

<style>
@import "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons";
@import '../assets/quasar.prod.css';

table {
    border-collapse: collapse;
    border: none;
}

th {
    border: none;
    background-color: #455a64;
    color: white
}

tr {
    border-top: 1px solid black;
    border-bottom: 1px solid black;
}

tr:last-child {
    border-top: 2px solid black;
    border-bottom: 2px solid black;
}

td {
    border: none !important;
}
</style>