<template>
    <!-- 2. RAW PARKING NEEDS -->
    <div class="q-pa-md">
        <div class="text-h5">Étape 2: Calcul du besoin brut</div>
        <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders">
            <q-select outlined bottom-slots bg-color="white" v-model="affectationModel" :options="affectationOptions"
                option-value="name" option-label="name" @update:model-value="selectOption()" multiple
                label="Affectation(s)">
                <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                        <!--
                            :options="this.affectationOptions.filter(o => !o.active)"
                        -->
                        <!--
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.icon" />
                  </q-item-section>
                  -->
                        <q-item-section side>
                            <q-checkbox v-model="scope.opt.active" />
                            <!-- <q-checkbox :model-value="scope.opt.active" /> -->

                            <!-- <q-checkbox :model-value="scope.selected" @update:model-value="scope.toggleOption(scope.opt)" /> -->
                        </q-item-section>

                        <!--
                        <q-item-section avatar class="childDiv">

                            <q-checkbox v-model="selectModel" :val="scope.opt.active" />
                            <q-icon name="add_circle"></q-icon>
                            <q-btn flat dense icon="add" color="primary" @click="addItem" label="Ajouter"></q-btn>
                        </q-item-section>
                        -->
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

                <!--
                <template v-slot:after>
                    <q-btn flat icon="add" color="primary" @click="addItem" label="Ajouter"></q-btn>
                </template>
                -->

            </q-select>

        </div>
        <!--
        <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders"
            v-for="(item, key) in this.affectationOptions.filter(o => o.active)">
            -->

        <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders" v-for="(item, key) in this.affectationModel">

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

// Factor
class Factor {
    constructor(type, name, areaFactor, housingFactor, activityFactor, area, housing) {
        this.type = type
        this.name = name
        this.areaFactor = parseFloat(areaFactor)
        this.housingFactor = parseFloat(housingFactor)
        this.activityFactor = parseFloat(activityFactor)
        this.area = parseFloat(area)
        this.housing = parseFloat(housing)
        this.active = false
    }
    get isHousing() {
        return this.type === "Logement"
    }
    get rawResidentNeed() {
        return parseFloat(Math.max(this.area * this.areaFactor * this.housingFactor, this.housing).toFixed(2))
    }
    get rawVisitorNeed() {
        return parseFloat((this.area * this.areaFactor * this.activityFactor).toFixed(2))
    }
    get rawTotalNeed() {
        return (this.rawResidentNeed + this.rawVisitorNeed).toFixed(2)
    }
}

const factors = []
factors.push(new Factor("Logement", "Logements standards", 0.01, 1, 0.1, 0, 0))
factors.push(new Factor("Logement", "Logements avec encadrement ou étudiants", 0.01, 1, 0.1, 0, 0))
factors.push(new Factor("Activité", "Services à nombreuse clientèle", 0.01, 2, 1, 0, 0))
factors.push(new Factor("Activité", "Magasins à nombreuse clientèle", 0.01, 2, 8, 0, 0))
factors.push(new Factor("Activité", "Autres magasins", 0.01, 1.5, 3.5, 0, 0))
factors.push(new Factor("Activité", "Industrie et artisanat", 0.01, 1, 0.2, 0, 0))
factors.push(new Factor("Activité", "Entrepôts et dépôts", 0.01, 0.1, 0.01, 0, 0))
factors.push(new Factor("Activité", "Autres services", 0.01, 2, 0.5, 0, 0))


export default {
    name: 'Table',
    components: {},
    props: { 'model': Object },
    emits: ['deleteItem'],
    setup() {
        return {
            // model: ref(null),
        }
    },
    data() {
        return {
            factors: factors,
            affectationOptions: factors,
            affectationModel: null,
        }
    },
    computed: {
        activeOptions() {
            return this.affectationOptions.filter(o => o.active)
        }
    },
    methods: {
        addItem() {
            // this.affectations.push(new Factor("Logement", "Logements standards", 0.01, 1, 0.1, 0, 0))
            if (this.affectationModel !== null) {
                this.affectationModel.active = true
                this.affectationModel = null
            }

        },
        selectOption() {

            console.log('Select option')
            console.log(this.affectationModel)

            // let index = this.affectationOptions.findIndex((obj) => obj.name === this.affectationModel.name)

            this.affectationOptions.forEach(function (e) {
                e.active = false
            });


            this.affectationModel.forEach(function (e) {
                e.active = true
            });

            // this.affectationModel.active = true

            // console.log(this.affectationModel.active)
            // console.log(this.affectationOptions[index].active)


        },
        deleteItem(item) {

            console.log(`Delete item with id=${item.name}`)
            this.affectationModel = this.affectationModel.filter(e => e !== item)

            let index = this.affectationOptions.findIndex((obj) => obj.name === item.name)
            this.affectationOptions[index].active = false

            //console.log(item)
            //console.log(`Delete item with id=${item.name}`)


            // console.log(`Deactivate option with name=${item.name}`)

            // this.affectationOptions[index].active = false


            // this.$emit('deleteItem', item.id);

        },
    }
}
</script>

<style>
@import "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons";
@import '../assets/quasar.prod.css';
</style>