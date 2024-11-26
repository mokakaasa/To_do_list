import '../css/app.css'
import { createApp,h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import { createVuetify } from 'vuetify';
import 'vuetify/styles'; // Import Vuetify CSS
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
    components,
    directives,
  });

createInertiaApp({
    resolve:name =>require(`./Pages/${name}`),
    setup({el, App, props, plugin}) {
        createApp({ render: () => h(App, props) })
         .use(plugin)
         .use(vuetify)  
         .mount(el)
    },
})