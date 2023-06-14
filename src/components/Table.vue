<template>
    <!-- <div class="q-pa-md"> -->
    <q-table title="" :rows="rows" :columns="columns" row-key="id" v-model:pagination="pagination" :loading="loading"
        :filter="filter" dense>
        <!-- TABLE BODY -->
        <template v-slot:body="props">
            <q-tr :props="props">
                <!-- label column -->
                <q-td key="label" :props="props">
                    <b>{{ props.row.properties.label }}</b>
                </q-td>
                <!-- commune column -->
                <q-td key="comnom" :props="props">
                    <b>{{ props.row.properties.comnom }}</b>
                </q-td>
                <!-- actions column -->
                <q-td key="actions" :props="props">
                    <q-btn dense round flat color="grey" name="print" @click="focusItem(props.row)" icon="map"></q-btn>
                    <q-btn dense round flat color="grey" name="delete" @click="deleteItem(props.row)" icon="delete"></q-btn>
                </q-td>
            </q-tr>
        </template>
    </q-table>
    <!--</div> -->
</template>

<script>
import { ref } from 'vue'
export default {
    props: { 'rows': Array, 'model': Object },
    emits: ['deleteItem'],
    setup() {
        return {
            // model: ref(null),
        }
    },
    data() {
        return {
            loading: false,
            filter: "",
            pagination: {
                sortBy: "desc",
                descending: false,
                page: 1,
                rowsPerPage: 20,
                // rowsNumber: 10
            },
            columns: [
                {
                    name: "label",
                    align: "left",
                    label: "Parcelle",
                    field: "label",
                    sortable: true,
                },
                {
                    name: "comnom",
                    align: "left",
                    label: "Commune",
                    field: "comnom",
                    sortable: true,
                },
                {
                    name: "actions",
                    align: "center",
                    label: "",
                    field: "",
                    sortable: false,
                },
            ],
        }
    },
    computed() {

    },
    methods: {
        deleteItem(item) {
            console.log(item)
            console.log(`Delete item with id=${item.id}`)
            this.$emit('deleteItem', item.id);

            this.$emit('action', { type: "delete", id: item.id });

        },
        focusItem(item) {
            console.log(`Focus on item with id=${item.id}`)
            this.$emit('focusItem', item.id);
            this.$emit('action', { type: "focus", id: item.id });

        }
    }
}
</script>


<style>
@import "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons";
@import '../assets/quasar.prod.css';
</style>