// Global imports (app.css for styling)
import '../css/app.css';

// Vue 3 and Inertia.js imports
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';

// Vuetify imports
// import { createVuetify } from 'vuetify';
// import 'vuetify/styles'; // Vuetify CSS
// import * as components from 'vuetify/components';
// import * as directives from 'vuetify/directives';

// PrimeVue imports
// import PrimeVue from 'primevue/config';
// import ToastService from 'primevue/toastservice'; // Optional: For Toast notifications
// import Tooltip from 'primevue/tooltip'; // Optional: Tooltip directive
// import DialogService from 'primevue/dialogservice'; // Optional: For modal dialogs
// import Button from 'primevue/button';

// PrimeVue CSS (global application of PrimeVue theme and core CSS)
// import '@primevue/core/resources/themes/lara-light-indigo/theme.css';
// import '@primevue/core/resources/primevue.min.css';
// import 'primeicons/primeicons.css'; // PrimeIcons

// Vuetify configuration (to use Vuetify components and directives globally)
// const vuetify = createVuetify({
//   components,
//   directives,
// });

// Inertia.js setup
createInertiaApp({
  resolve: (name) => require(`./Pages/${name}`), // Resolving page components
  setup({ el, App, props, plugin }) {
 createApp({ render: () => h(App, props) })

    // Use plugins globally
    .use(plugin)
    // vueApp.use(vuetify);
    // vueApp.use(PrimeVue, { ripple: true }); // Enable Ripple effect globally
    // vueApp.use(ToastService); // Optional: Toast notifications globally
    // vueApp.use(DialogService); // Optional: Dialog service globally

    // Register global components
    // vueApp.component('Button', Button);

    // Register global directives
    // vueApp.directive('tooltip', Tooltip);

    // Mount Vue app to the DOM
    .mount(el);
  },
});
