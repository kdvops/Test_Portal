// plugins/consent-head.server.ts  (SSR)
export default defineNuxtPlugin(() => {
  const consent = useCookie<'accepted' | 'rejected' | null>('app_cookie_consent')
  if (consent.value === 'accepted') {
    useHead({
      script: [{ 
        key: 'evgnet', 
        src: 'https://cdn.evgnet.com/beacon/bancosantacruz/bsc_prd_new/scripts/evergage.min.js', 
        async: false,
        tagPosition: 'head',
        tagPriority: 1000
      }]
    })
  }
})
