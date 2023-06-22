<template>
    <!--<div class="q-pa-md"> -->
    <q-select outlined bg-color="white" v-model="model" autofocus use-input hide-selected input-debounce="0" clearable
        :options="options" option-label="features.properties.label" option-value="features.id"
        @update:model-value="selectOption()" @filter="fetchSources" @filter-abort="" label="N° de parcelle"
        hint="Cliquer pour ajouter une parcelle à la liste" class="q-py-md">
        <template v-slot:prepend>
            <q-icon name="search" @click.stop.prevent></q-icon>
        </template>

        <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps" class="parentDiv">
                <q-item-section avatar class="childDiv">
                    <q-icon name="add_circle"></q-icon>
                    <!-- <q-icon :name="scope.opt.icon"></q-icon> -->
                </q-item-section>

                <q-item-section>
                    <q-item-label>{{ scope.opt.properties.label }}
                    </q-item-label>
                    <q-item-label caption>IDMAI: {{ scope.opt.properties.idmai }}</q-item-label>
                    <q-item-label caption>Commune: {{ scope.opt.properties.comnom }} (n° {{
                        scope.opt.properties.comnum }})
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>

        <template v-slot:no-option>
            <q-item>
                <q-item-section class="text-grey">
                    No results
                </q-item-section>
            </q-item>
        </template>
    </q-select>
    <!--
        <div class="q-gutter-md">
            <q-select v-model="model" :options="options" option-label="name" option-value="id" label="Standard" />
        </div>
        -->
    <!--</div> -->
</template>

<script>
import { ref } from 'vue'
export default {
    name: 'Search',
    components: {},
    props: { 'title': String, 'options': Object, 'model': Object, 'selected': Object },
    emits: ['addOption'],
    setup() {
        return {
            model: ref(null),
            options: ref(null),
        }
    },
    data() {
        return {
            count: 0
        }
    },
    methods: {
        selectOption() {
            if (this.model !== null) {
                // add item
                console.log(`Search.vue | Option selected: ${this.model.properties.label}`);

                this.$emit('addOption', this.model);

                // this.rows.push(this.model.properties);
                // console.log(toRaw(this.rows));

                // reset selection
                this.model = null;
            }
        },
        fetchIntersection(body) {
            var requestOptions = {
                method: 'POST',
                headers: '',
                body: body,
                redirect: 'follow'
            };

            fetch("https://sitn.ne.ch/apps/stationnement/", requestOptions)
                .then(response => response.text())
                .then(result => console.log(result))
                .catch(error => console.log('error', error));
        },
        fetchSources(val, update, abort) {

            // call abort() when no data is returned
            if (val.length < 2) {
                abort();
                return;
            }

            console.log(val);

            // fetch from database
            update(() => {
                var requestOptions = {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    redirect: "follow",
                };

                fetch(`https://sitn.ne.ch/permis_construire/search?query=${encodeURIComponent(val)}`,
                    requestOptions
                )
                    .then((response) => response.json())
                    .then((data) => {
                        // console.log(data);
                        this.options = data.features;
                    })
                    .catch((error) => console.log("error", error));
            });

            //
        },
    },
}
</script>

<style>
@import "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons";
@import '../assets/quasar.prod.css';
</style>