<template>
    <!-- 3. NET PARKING NEEDS -->
    <div class="q-pa-md">
        <div class="text-h5">Étape 5: Résumé</div>

        <div class="row">
            <div class="q-pa-md q-ma-none col-xs-12 col-sm-6 col-md-4"
                v-for="(item, key) in this.project.affectations.filter(e => e.active)">
                <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders">

                    <table>
                        <tr>
                            <th>{{ item.name }}</th>
                            <th>Min.</th>
                            <th>Max.</th>
                        </tr>

                        <tr>
                            <td> {{ item.type == "Logement" ? "Besoin net réduit habitant" : "Besoin net réduit employé" }}
                            </td>
                            <td class="bg-light-blue-1">{{ item.reducedNetResidentNeed.min.toFixed(2) }}</td>
                            <td class="bg-light-blue-1">{{ item.reducedNetResidentNeed.max.toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td>{{ item.type == "Logement" ? "Besoin net réduit visiteur" : "Besoin net réduit client" }}
                            </td>
                            <td class="bg-light-blue-1">{{ item.reducedNetVisitorNeed.min.toFixed(2) }}</td>
                            <td class="bg-light-blue-1">{{ item.reducedNetVisitorNeed.max.toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td class="text-weight-bold">Besoin net réduit total</td>
                            <td class="bg-light-blue-1 text-weight-bold">{{ (item.reducedNetResidentNeed.min +
                                item.reducedNetVisitorNeed.min).toFixed(2)
                            }}</td>
                            <td class="bg-light-blue-1 text-weight-bold">{{ (item.reducedNetResidentNeed.max +
                                item.reducedNetVisitorNeed.max).toFixed(2)
                            }}</td>
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
</style>