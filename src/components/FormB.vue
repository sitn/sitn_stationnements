<template>
    <!-- 2. RAW PARKING NEEDS -->
    <div class="q-pa-md">
        <div class="text-h5">Étape 2: Calcul du besoin brut</div>
        <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders">
            <q-select outlined bottom-slots bg-color="white" v-model="model" :options="this.project.affectations"
                option-value="name" option-label="name" @update:model-value="selectOption()" multiple
                label="Affectation(s)">
                <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                        <q-item-section side>
                            <q-checkbox v-model="scope.opt.active" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>{{ scope.opt.name }}</q-item-label>
                            <q-item-label caption>Selected: {{ scope.selected }}</q-item-label>
                            <q-item-label caption>Active: {{ scope.opt.active }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </template>

                <template v-slot:hint>
                    Sélectionner une ou plusieurs affectations dans la liste
                </template>

            </q-select>

        </div>

        <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders" v-for="(item, key) in this.model">

            <label class="text-h7 ">{{ item.name }} </label>
            <div class="row q-col-gutter-sm">

                <div class="col">
                    <q-input class="col" bg-color="white" outlined label="" type="number" name="item.area"
                        v-model.number="item.area" min="0.0" max="Inf">
                        <template v-slot:label>
                            Surface brute de plancher (SBP) <!-- en m<sup>2</sup> -->
                        </template>

                        <template v-slot:append>
                            <div class="text-body2">m<sup>2</sup></div>
                        </template>

                    </q-input>
                </div>

                <div class="col">
                    <q-input v-if="item.isHousing" class="col" bg-color="white" outlined label="Nombre de logements"
                        type="number" name="item.housing" v-model.number="item.housing" min="0.0" max="Inf">
                    </q-input>
                </div>

                <div class="col">
                    <q-input bg-color="light-blue-1" outlined label="Besoin brut habitant/employé" type="number"
                        name="item.rawResidentNeed" v-model.number="item.rawResidentNeed" readonly>
                    </q-input>
                </div>

                <div class="col">
                    <q-input class="col" bg-color="light-blue-1" outlined label="Besoin brut visiteur/client" type="number"
                        name="item.rawVisitorNeed" v-model.number="item.rawVisitorNeed" readonly>
                    </q-input>
                </div>

                <div class="col">
                    <q-input class="col" bg-color="light-blue-1" outlined label="Besoin brut total" type="number"
                        name="item.rawVisitorNeed" v-model.number="item.rawTotalNeed" readonly>
                    </q-input>
                </div>
                <div class="col">
                    <q-btn round flat color="grey" name="delete" @click="deleteItem(item)" icon="delete"></q-btn>
                </div>

            </div>
        </div>

    </div>
</template>

<script>
import { ref } from 'vue'

export default {
    name: 'FormB',
    components: {},
    props: { 'project': Object },
    emits: ['updateProject', 'deleteItem'],
    setup() {
        return {
            // model: ref(null),
        }
    },
    data() {
        return {
            model: null,
        }
    },
    computed: {
    },
    methods: {
        selectOption() {

            console.log('Select option')
            console.log(this.model)

            this.project.affectations.forEach(function (e) {
                e.active = false
            });

            this.model.forEach(function (e) {
                e.active = true
            });

            this.updateProject()

        },
        deleteItem(item) {

            console.log(`Delete item with id=${item.name}`)
            this.model = this.model.filter(e => e !== item)

            let index = this.project.affectations.findIndex((obj) => obj.name === item.name)
            this.project.affectations[index].active = false

            //console.log(item)
            //console.log(`Delete item with id=${item.name}`)

            this.updateProject()

        },
        updateProject() {
            this.$emit('updateProject', this.project);
        }
    }
}
</script>

<style>
@import "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons";
@import '../assets/quasar.prod.css';
</style>