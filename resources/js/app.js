// Global imports (app.css for styling)
import '../css/app.css';

// Vue 3 and Inertia.js imports
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { PaginationBar } from 'v-page'



// Inertia.js setup
createInertiaApp({
  resolve: (name) => require(`./Pages/${name}`), // Resolving page components
  setup({ el, App, props, plugin }) {
 createApp({ render: () => h(App, props) })

    // Use plugins globally
    .use(plugin)

    .use(PaginationBar)

    // Mount Vue app to the DOM
    .mount(el);
  },
});
