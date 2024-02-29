<template>
    <!-- 2. RAW PARKING NEEDS -->
    <div class="q-px-md">

        <q-banner inline-actions class="text-white bg-red q-my-md q-pa-md rounded-borders" v-if="!this.render">
            <template v-slot:avatar>
                <q-icon name="error" color="white" />
            </template>
            <span class="text-body1">Veuillez compléter l'étape précédente</span>
        </q-banner>

        <!-- INFOBOX  -->
        <q-list class="q-my-md" v-if="this.render">
            <q-expansion-item class="bg-grey-1">
                <!-- <q-expansion-item icon="help" label="Informations et aide sur le calcul" caption="Cliquer pour ouvrir l'aide" class="bg-grey-1"> -->
                <template v-slot:header>
                    <q-item-section avatar>
                        <q-icon name="help" color="orange-7" text-color="black" size="2rem" /> <!-- #f78a15 -->

                    </q-item-section>

                    <q-item-section>
                        <div class="text-body2 text-weight-bold">Informations et aide sur le calcul</div>
                        <div class="text-caption">Cliquer pour ouvrir/fermer</div>
                    </q-item-section>

                    <q-item-section side>

                    </q-item-section>
                </template>

                <!-- <q-card flat class="bg-grey-1 q-pa-md q-my-md infobox" v-if="this.render"> -->
                <q-card flat class="q-pa-none">
                    <!-- <q-card-section horizontal> -->

                    <q-card-section class="">
                        <!-- <div class="text-body2 text-weight-bold q-mb-sm">Informations et aide sur le calcul</div> -->

                        <div class="text-body2">
                            <ul>
                                <li>Le besoin brut en places de stationnement est calculé selon les ratios du tableau 1 de l’annexe 1 du RELConstr.</li>

                                <li>Pour que le calcul soit fait au plus juste des besoins, il est important de préciser toutes
                                    les affectations comprises dans le projet, en particulier pour les projets d’activité.
                                    Ainsi, un projet pour une manufacture horlogère comprendra possiblement des surfaces
                                    affectées à « industrie et artisanat », « entrepôts et dépôts » et « autres services ».</li>

                                <li>S’agissant des places de stationnement voiture, pour les affectations moins fréquentes les ratios sont à rechercher dans le tableau 1 de la norme VSS 40 281 (2019). Le nombre de places obtenu est à indiquer manuellement.</li>

                                <li>S’agissant des places de stationnement vélo, pour les affectations moins fréquentes les ratios sont à rechercher dans les tableaux de la norme VSS 40 065 (2019). Le nombre de places obtenu est à indiquer manuellement.</li>

                                <li>S’agissant des places de stationnement deux-roues motorisés, le calcul se fait automatiquement sur la base du nombre de places de stationnement voiture (15% à réaliser à partir de trois logements ou pour les activités).</li>

                                <li>La surface brute de plancher (SBP) correspond à la somme des surfaces utiles principales,
                                    des surfaces de dégagement et des surfaces de construction au sens de l’article 16 RELCAT.
                                </li>

                            </ul>

                            <div class="row q-col-gutter-sm q-py-xs">
                                <figure>
                                    <img src="/img/surfaces.svg" alt="Surface brute de plancher">
                                    <!--
                                    <img src="/img/doc_sbp.svg" alt="Surface brute de plancher">
                                    <figcaption>Illustration issue du décret cantonal (720.5) portant adhésion à l'accord intercantonal harmonisant la terminologie dans le domaine des constructions (AIHC).</figcaption>
                                    -->
                                </figure>
                            </div>


                        </div>
                    </q-card-section>

                    <!-- </q-card-section> -->

                </q-card>

            </q-expansion-item>
        </q-list>

        <!-- FORM -->
        <q-form ref="formB" greedy no-error-focus no-reset-focus @validation-success="validationSuccess" @validation-error="validationError">

            <div class="bg-grey-1 q-pa-md q-my-md rounded-borders" v-if="this.render">

                <q-select outlined bottom-slots bg-color="white" v-model="model" :options="this.project.affectations" option-value="name" option-label="name" @add="addOption()" @remove="removeOption()" @update:model-value="selectOption()" multiple label="Affectation(s)" :rules="[(val) => val.length > 0 || 'Veuillez choisir une ou plusieurs affectations dans la liste']">

                    <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                            <q-item-section side>
                                <q-checkbox :model-value="scope.selected" @update:model-value="scope.toggleOption(scope.opt)" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ scope.opt.name }}</q-item-label>
                                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>

                                <q-chip square :color="scope.opt.automatic ? 'blue' : 'orange'" text-color="white" :icon="scope.opt.automatic ? 'calculate' : 'article'">
                                    {{ scope.opt.automatic ? 'AUTO' : 'VSS' }}
                                </q-chip>

                            </q-item-section>
                            <q-tooltip>
                                {{ scope.opt.automatic ? 'Le calcul du besoin brute est automatique pour cette affectation' : 'Le calcul du besoin brute doit être fait manuellement selon les formules du tableau 1 de la norme VSS 40 281 (2019) pour cette affectation' }}
                            </q-tooltip>
                        </q-item>
                    </template>

                    <template v-slot:hint>
                        Choisir une ou plusieurs affectations dans la liste
                    </template>
                </q-select>

            </div>


            <div v-if="this.render" class="bg-grey-1 q-pa-md q-my-md rounded-borders" v-for="(item, key) in this.project.getAffectations()">

                <div class="row q-col-gutter-sm q-py-xs">
                    <label class="text-h7">
                        <q-chip square color="black" text-color="white">
                            {{ item.name }}
                            <q-tooltip>
                                {{ item.name }}
                            </q-tooltip>
                        </q-chip>
                        <q-chip square :color="item.automatic ? 'blue' : 'orange'" text-color="white" :icon="item.automatic ? 'calculate' : 'article'">
                            {{ item.automatic ? 'CALCUL AUTOMATIQUE' : 'CALCUL MANUEL CF. NORME VSS' }}
                            <q-tooltip>
                                {{ item.automatic ? 'Le calcul du besoin brute est automatique pour cette affectation' : 'Le calcul du besoin brute doit être fait manuellement selon les formules du tableau 1 de la norme VSS 40 281 (2019) pour cette affectation' }}
                            </q-tooltip>
                        </q-chip>

                    </label>
                </div>

                <div class="row q-col-gutter-sm q-py-xs">

                    <!-- INPUT FIELDS -->
                    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-3" v-for="(variable, key2) in item.variables.filter((x) => x.type === 'measurement')">
                        <q-input bg-color="white" outlined label="" type="number" name="" v-model.number="variable.value" :min=variable.min :max=variable.max @update:model-value="check(variable)" :rules="[val => validateRange(val, variable.min, variable.max)]" :hint=variable.hint> <!-- :rules="[val => validatePositive(val)]" [val => validateRange(val, variable.min, variable.max)]-->
                            <template v-slot:label>
                                {{ variable.name }}
                            </template>

                            <template v-slot:append>
                                <div class="text-body2" v-html="variable.unit"></div>
                            </template>

                            <template v-slot:hint>

                            </template>

                        </q-input>
                    </div>

                    <div class="col">
                        <q-btn round flat color="grey" name="delete" @click="deleteItem(item)" icon="delete" class="float-right"></q-btn>
                    </div>

                </div>

            </div>

        </q-form>

        <!-- COMPUTATION SUMMARY TABLES -->
        <div class="row overflow-scroll" v-if="this.render">

            <!-- CAR PARKINGS SUMMARY TABLE -->
            <div id="summary-container-1" class="col-xs-12 col-sm-12 col-md-12 col-lg-8">

                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table class="total-row">
                        <caption class="text-subtitle1">Stationnements voitures</caption>
                        <thead>
                            <tr>
                                <th>Affectation</th>
                                <th>Type de place</th>
                                <th class="text-right"><q-avatar rounded size="md" font-size="25px" color="blue-10" text-color="white" icon="directions_car" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="item in this.project.getAffectations()">

                                <tr v-for="(subitem, iSub) in item.getRawOutputs(['car'])">
                                    <td v-if="iSub === 0" :rowspan="item.getOutputs(['car']).length" class="">{{ item.name }}</td>
                                    <td>{{ subitem.name }}</td>
                                    <td class="bg-light-blue-1 text-right">{{ subitem.value.toFixed(2) }}</td>
                                </tr>

                            </template>
                            <tr>
                                <td class="text-weight-bold">Besoin brut total</td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ this.project.getRawNeeds(['car']).toFixed(2) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>

        </div>

    </div>
</template>

<script>
import { store } from '../store/store.js'

export default {
    name: 'FormB',
    components: {},
    props: {},
    emits: ['deleteItem', 'filled'],
    setup() {
        return {}
    },
    data() {
        return {
            store,
            project: store.project,
            model: [],
        }
    },
    computed: {
        render() {
            // return (this.project.commune !== null) & (this.project.locationType !== null)
            return store.validity.A // (this.project.commune !== null) & (this.project.locationType !== null) & 
        },
        filled() {
            return this.project.hasAffectation & (this.project.locationType !== null)
        }
    },
    watch: {
        filled(val) {
            // this.store.validity.B = val

            this.$emit('filled', val)
        }
    },
    mounted() {
        this.validateForm()
    },
    updated() {
        this.validateForm()
    },
    methods: {
        validatePositive(val) {
            return val !== null && val !== '' && val > 0.0 || "Veuillez entrer une valeur positive"
        },
        validateRange(val, min, max) {
            let isValid = val !== null && val !== '' && val >= min && val <= max
            if (isValid === false) {
                val = null
            }
            let msg
            if (max === Infinity) {
                msg = `Veuillez entrer une valeur ≥ à ${min}`
            } else {
                msg = `Veuillez entrer une valeur entre ${min} et ${max}`
            }
            return isValid || msg
        },
        check(item) {
            // console.log(item)
            let isValid = item.value >= item.min && item.value <= item.max
            if (!isValid) {
                item.value = null
            } else {
                item.value = item.value
            }

            this.validateForm()
        },
        addOption() {
            // console.log('Add option')
        },
        removeOption() {
            // console.log('Remove option')
        },
        selectOption() {

            let activeOptions = this.model.map(obj => obj.name)

            // all affectations not in the model should be set to non-active
            this.project.affectations.forEach(function (e) {

                if (!activeOptions.includes(e.name)) {
                    e.active = false
                }

            })

            // set all elements in model (selected) to active
            // changing the model here will also change the project prop
            this.model.forEach(function (e) {
                e.active = true
            })

            this.validateForm()

        },
        deleteItem(item) {

            // console.log(`Delete item with id=${item.name}`)
            this.model = this.model.filter(e => e !== item)

            let index = this.project.affectations.findIndex((obj) => obj.name === item.name)
            this.project.affectations[index].active = false

            this.project.affectations[index].area = 0.0
            this.project.affectations[index].numberOfHouses = 0.0

            this.validateForm()

        },
        validateForm() {
            if (this.$refs.hasOwnProperty('formB')) {
                if (this.$refs.formB !== null) {
                    this.$nextTick(() => { this.$refs.formB.validate() })
                }
            }
        },
        validationSuccess() {
            // console.log(`${this.$options.name} | validationSuccess()`)
            this.store.validity.B = true
            // console.log(this.store.validity)
        },
        validationError() {
            // console.log(`${this.$options.name} | validationError()`)
            this.store.validity.B = false
            // console.log(this.store.validity)
        }
    }
}
</script>

<style scoped>
@import '../assets/styles/table.css';
</style>