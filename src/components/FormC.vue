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
                            <th>Min.</th>
                            <th>Max.</th>
                        </tr>
                        <!-- 
                        <tr>
                            <td>Fourchette du type de localisation {{ project.locationType }}</td>
                            <td>Min.</td>
                            <td>Max.</td>
                        </tr>
                        -->
                        <tr>
                            <td>Besoin net habitant/employé</td>
                            <td class="bg-light-blue-1">{{ item.netResidentNeed([0.5, 1])[0] }}</td>
                            <td class="bg-light-blue-1">{{ item.netResidentNeed([0.5, 1])[1] }}</td>
                        </tr>
                        <tr>
                            <td>Besoin net visiteur/client</td>
                            <td class="bg-light-blue-1">{{ item.netVisitorNeed([1, 1])[0] }}</td>
                            <td class="bg-light-blue-1">{{ item.netVisitorNeed([1, 1])[1] }}</td>
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

<style>
@import "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons";
@import '../assets/quasar.prod.css';
</style>