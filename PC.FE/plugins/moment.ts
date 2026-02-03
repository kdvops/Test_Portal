import { defineNuxtPlugin } from '#app'

import moment from "moment"
import 'moment/dist/locale/es.js'
moment.updateLocale('es', null)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('app', {
    $moment: moment,
  })
})