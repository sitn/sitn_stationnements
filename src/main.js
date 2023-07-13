import { createApp } from 'vue'
import { Quasar } from 'quasar'
import App from './App.vue'
// import './assets/main.css'
// import './assets/ol.css'

const app = createApp(App)
app.use(Quasar, {
    config: {
    },

})
app.mount('#q-app')