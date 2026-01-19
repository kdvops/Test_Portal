<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: '/sobre-nosotros/historia'
})

// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

// IMPORT OPTIMIZED IMAGE COMPONENTS
import HeroImage from '~/components/optimized-image/HeroImage.vue';
import ThumbnailImage from '~/components/optimized-image/ThumbnailImage.vue';

// Las imágenes ahora se cargan directamente desde las rutas públicas
const faustoArturoImage = '/assets/images/Sr.Pimentel.png';
const fernandoRosarioImage = '/assets/backgrounds/fernando_rosario.png';
const luisEmilioImage = '/assets/backgrounds/luis_emilio_ramirez.png';
const faustoArielImage = '/assets/backgrounds/fausto_ariel_pimentel.png';
const faustoArmandoImage = '/assets/backgrounds/fausto_armando_pimentel.png';
const leonardoJesusImage = '/assets/backgrounds/leonardo_jesus_hincapie.png';
const silvinoJoseImage = '/assets/backgrounds/silvino_jose_pichardo.png';
const eduardoMarreroImage = '/assets/backgrounds/eduardo_marrero.png';
const rafaelJiminianImage = '/assets/backgrounds/rafael_jiminian.png';
const irvinIsidorImage = '/assets/backgrounds/irvin_isidor.png';
const maribelConcepcionImage = '/assets/backgrounds/maribel_concepcion.png';
const manuelMartinezImage = '/assets/backgrounds/manuel_martinez.png';
const melvinDeschampsImage = '/assets/backgrounds/melvin_deschamps.png';
const vildaniaNunezImage = '/assets/backgrounds/vildania_nunez.png';
const mariaPeraltaImage = '/assets/backgrounds/maria_peralta.png';
const luisSuarezImage = '/assets/backgrounds/luis_suarez.png';
const faustoDebesImage = '/assets/backgrounds/fausto_debes.png';
const ingridDebesImage = '/assets/backgrounds/ingrid_debes.png';
const rafaelReyesImage = '/assets/backgrounds/rafael_reyes.png';
const elauriRodriguezImage = '/assets/backgrounds/elauri_rodriguez.png';
const omarBairanImage = '/assets/backgrounds/omar_bairan.png';
const marianelaBorjas = '/assets/backgrounds/IMG_4306.jpeg';

// IMPORT INTERFACES
import type { PersonInterface } from '~/interfaces/about.interface'

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'about-history-screen',
  components: {
    HeroImage,
    ThumbnailImage
  }
})

// EXPORT BANNER COMPONENT
export default class AboutHistoryScreen extends Vue {
  // LIST OF DIRECTORS
  directors: Array<PersonInterface> = [
    { name: "Fausto Arturo Pimentel", position: "Presidente Ejecutivo", image: faustoArturoImage },
    { name: "Fernando Rosario", position: "Vicepresidente", image: fernandoRosarioImage },
    { name: "Luis Emilio Raymundo Pappaterra", position: "Director", image: luisEmilioImage },
    { name: "Fausto Ariel Pimentel", position: "Director", image: faustoArielImage },
    { name: "Fausto Armando Pimentel", position: "Secretario", image: faustoArmandoImage },
    { name: "Leonardo de Jesús Hincapié", position: "Director", image: leonardoJesusImage },
    { name: "Marianela Borjas", position: "Director", image: marianelaBorjas },
    { name: "Silvino José Pichardo Benedicto", position: "Director", image: silvinoJoseImage }
  ];

  // LIST OF LEADERS
  leaders: Array<PersonInterface> = [
    { name: "Eduardo Marrero", position: "Vicepresidente Senior de Banca Empresa.", image: eduardoMarreroImage },
    { name: "Rafael Jiminián", position: "Vicepresidente Ejecutivo de Negocios.", image: rafaelJiminianImage },
    { name: "Irvin Isidor", position: "Vicepresidente de Desarrollo de Negocios.", image: irvinIsidorImage },
    { name: "Maribel Concepción", position: "Vicepresidente Gestión Integral de Riesgos.", image: maribelConcepcionImage },
    { name: "Manuel Martínez", position: "Vicepresidente de Tesorería.", image: manuelMartinezImage },
    { name: "Melvin Felipe Deschamps", position: "Vicepresidente de Finanzas y Planificación.", image: melvinDeschampsImage },
    { name: "Vildania Núñez", position: "Vicepresidente Senior de Operaciones.", image: vildaniaNunezImage },
    { name: "María del Pilar Peralta", position: "Vicepresidente de Experiencia Colaborador.", image: mariaPeraltaImage },
    // { name: "William Vinasco Bernal", position: "Vicepresidente Ejecutivo de Negocios.", image: williamVinascoImage },
    { name: "Luis Ignacio Suárez", position: "Vicepresidente de Tecnología.", image: luisSuarezImage },
    { name: "Fausto Pimentel Debes", position: "Vicepresidente de Transformación Digital.", image: faustoDebesImage },
    { name: "Ingrid Debes", position: "Vicepresidente de RRPP y Comunicación Corporativa.", image: ingridDebesImage },
    // { name: "Ramón Guzmán Feliz", position: "Vicepresidente Cumplimiento PLAFT", image: ramonGuzmanImage },
    // { name: "Alexandra Feliz Martínez", position: "Vicepresidente Negocios Banca Institucional", image: alexandraFelizImage },
    { name: "Rafael Reyes", position: "Vicepresidente de Seguridad Física e Investigaciones.", image: rafaelReyesImage },
    { name: "Elauri Rodríguez", position: "Vicepresidente de Auditoría.", image: elauriRodriguezImage },
    { name: "Omar de Jesús Bairan García", position: "Vicepresidente de Consultoría Jurídica y Cumplimiento Regulatorio", image: omarBairanImage }
  ];

}
</script>

<!-- HTML TEMPLATE -->

<!-- components/Banner.vue -->
<template>
  <div>
    <!-- Banner container with full width -->
    <v-row no-gutters>
      <v-col cols="12" style="position: relative; z-index: 0;">
        <!-- Banner image with text overlay optimizada -->
        <HeroImage
          src="/assets/backgrounds/HeroBannerWeb-texto.jpg"
          alt="Banner Historia Banco Santa Cruz"
          :width="1920"
          :height="500"
          loading="eager"
          class="banner-image"
        />
      </v-col>
    </v-row>

    <!-- BOARD OF DIRECTORS -->
    <v-container class="consejo-directores">
      <!-- MAIN HEADING OF THE SECTION -->
      <v-row>
        <v-col class="text-center">
          <h2 class="font-weight-bold-title">Consejo de Directores</h2>
          <p class="text-description"><b>NUESTRO CONSEJO DE DIRECTORES</b> está conformado por un grupo de empresarios
            exitosos, cuya trayectoria en el sector económico nacional constituye un valor agregado al capital de
            nuestra
            institución. Trabajadores incansables que creen en el crecimiento del país, pues forman parte de él al
            contribuir con ideas y planes de desarrollo que fortalecen nuestra sociedad.</p>
        </v-col>
      </v-row>
      <!-- LIST OF DIRECTORS -->
      <v-row>
        <!-- MAIN DIRECTOR ON THE LEFT -->
        <v-col cols="12" md="5" class="text-center main-director">
          <div class="main-director-image-wrapper">
            <ThumbnailImage
              :src="directors[0].image"
              :alt="`${directors[0].name} - Presidente Ejecutivo`"
              :width="480"
              :height="600"
              loading="lazy"
              container-class="main-director-image-container"
              image-class="main-director-image"
            />
          </div>
        </v-col>
        <!-- OTHER DIRECTORS ON THE RIGHT -->
        <v-col cols="12" md="7" class="d-flex flex-column justify-center pb-15">
          <v-row class="align-items-center">
            <v-col cols="6" v-for="director in directors.slice(1)" :key="director.name" class="text-center">
              <v-avatar size="120">
                <ThumbnailImage
                  class="director-image"
                  :src="director.image"
                  :alt="`${director.name} - ${director.position}`"
                  :width="120"
                  :height="120"
                />
              </v-avatar>
              <h3 class="font-weight-bold director-name">{{ director.name }}</h3>
              <p>{{ director.position }}</p>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <!-- PRINCIPAL LEADERS -->
    <div class="leaders-background" style="position: relative; z-index: 0;">
      <div class="leaders-bg-wrapper">
        <HeroImage
          src="/assets/backgrounds/BgLeaders.png"
          alt="Fondo de líderes principales"
          :width="1920"
          :height="1200"
          loading="lazy"
          class="leaders-bg-image"
        />
      </div>
      <v-container class="principal-leaders">
        <!-- MAIN HEADING OF THE SECTION -->
        <v-row>
          <v-col class="text-center">
            <h2 class="font-weight-bold-title-wh">Principales Líderes</h2>
            <p class="text-description-wh"><b>NUESTROS PRINCIPALES EJECUTIVOS</b> están conformados por un grupo de
              líderes, formadores de personas, inspiradores de equipos de trabajo, cuya trayectoria en el sector
              financiero representa un gran valor para el cumplimiento de todas las iniciativas y proyectos que nos
              permiten, año tras año, superar nuestros propios objetivos y mejorar nuestro posicionamiento en el
              mercado.
            </p>
          </v-col>
        </v-row>
        <!-- LIST OF LEADERS -->
        <v-row class="d-flex justify-center">
          <v-col cols="6" md="3" v-for="leader in leaders" :key="leader.name" class="text-center leaders-content">
            <v-avatar size="120">
              <ThumbnailImage
                :src="leader.image"
                :alt="`${leader.name} - ${leader.position}`"
                :width="120"
                :height="120"
              />
            </v-avatar>
            <h3 class="font-weight-bold-wh leader-name"><b>{{ leader.name }}</b></h3>
            <p class="position">{{ leader.position }}</p>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
// Styling for the banner container
.banner {
  position: relative;
  height: 500px;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.text-container {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
}

.text-container p {
  font-size: 22px;
}

.text-container h1 {
  font-size: 50px;
}

// Styling for the board of directors section
.consejo-directores {
  margin-top: 40px;
}

.consejo-directores .text-description {
  font-size: 18px;
  color: #777777;
  width: 80%;
  text-align: center;
  padding: 3%;
  margin: auto;
}

.text-description-wh {
  font-size: 18px;
  color: #ffffff;
  width: 80%;
  text-align: center;
  padding: 3%;
  margin: auto;
}

.consejo-directores .position {
  font-size: 16px;
  color: gray;
}

.font-weight-bold-title {
  color: #0067AB;
  opacity: 1;
  font-size: 30px;
}

.consejo-directores-wh .position {
  font-size: 16px;
  color: rgb(255, 255, 255);
}

.font-weight-bold-title-wh {
  color: #ffffff;
  opacity: 1;
  font-size: 30px;
}

// Additional styles for main director
.main-director {
  margin-top: 60px;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: flex-end;
  -webkit-align-items: flex-end;
  -ms-flex-align: flex-end;
  align-items: flex-end;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
}

.main-director-image-wrapper {
  width: 100%;
  max-width: 480px;
  margin: 0 auto 30px;
  position: relative;
}

.main-director-image-container {
  width: 100% !important;
  max-width: 480px !important;
  height: auto !important;
  aspect-ratio: 4 / 5 !important;
  margin: 0 auto !important;
  overflow: visible !important;
  background-color: transparent !important;
  border-radius: 0 !important;
  
  /* Fallback para Safari antiguo */
  @supports not (aspect-ratio: 4 / 5) {
    height: 600px !important;
    max-height: 600px !important;
  }
}

.main-director-image-container ::v-deep(.thumbnail-image-container) {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  overflow: visible !important;
  background-color: transparent !important;
  border-radius: 0 !important;
}

.main-director-image-container ::v-deep(.thumbnail-image) {
  width: 100% !important;
  height: 100% !important;
  -o-object-fit: contain !important;
  object-fit: contain !important;
  -o-object-position: center !important;
  object-position: center !important;
  display: block !important;
  /* Asegurar renderizado correcto en Safari */
  -webkit-transform: translateZ(0) !important;
  transform: translateZ(0) !important;
  -webkit-backface-visibility: hidden !important;
  backface-visibility: hidden !important;
}

/* Compatibilidad específica para Safari */
@supports (-webkit-appearance: none) {
  .main-director-image-container {
    /* Asegurar que las imágenes se rendericen correctamente */
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  
  .main-director-image-container ::v-deep(.thumbnail-image) {
    -webkit-transform: translateZ(0) !important;
    transform: translateZ(0) !important;
    -webkit-backface-visibility: hidden !important;
    backface-visibility: hidden !important;
  }
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .main-director {
    margin-top: 30px;
  }
  
  .main-director-image-wrapper {
    max-width: 100%;
    margin-bottom: 30px;
  }
  
  .main-director-image-container {
    max-width: 100% !important;
    aspect-ratio: 4 / 5 !important;
    
    @supports not (aspect-ratio: 4 / 5) {
      height: 450px !important;
      max-height: 450px !important;
    }
  }
}

.director-name {
  color: #0067AB;
  width: 50%;
  margin: auto;
}

.text-center b {
  color: #0067AB;
}

.font-weight-bold-wh b {
  font-size: 18px;
  color: #ffffff;
}

.director-image {
  width: 100%;
  height: 100%;
  -o-object-fit: cover !important;
  object-fit: cover !important;
  -o-object-position: center !important;
  object-position: center !important;
  /* Asegurar renderizado correcto en Safari */
  -webkit-transform: translateZ(0) !important;
  transform: translateZ(0) !important;
  -webkit-backface-visibility: hidden !important;
  backface-visibility: hidden !important;
}

/* Estilos para avatares de directores */
.v-avatar {
  overflow: hidden !important;
  border-radius: 50% !important;
}

.v-avatar ::v-deep(.thumbnail-image-container) {
  width: 100% !important;
  height: 100% !important;
  border-radius: 50% !important;
  overflow: hidden !important;
}

.v-avatar ::v-deep(.thumbnail-image) {
  width: 100% !important;
  height: 100% !important;
  -o-object-fit: cover !important;
  object-fit: cover !important;
  -o-object-position: center !important;
  object-position: center !important;
  border-radius: 50% !important;
  /* Asegurar renderizado correcto en Safari */
  -webkit-transform: translateZ(0) !important;
  transform: translateZ(0) !important;
  -webkit-backface-visibility: hidden !important;
  backface-visibility: hidden !important;
}

// Styling for the principal leaders section
.principal-leaders {
  position: relative;
  z-index: 2;
  margin-top: 40px;
  padding-bottom: 80px;
  padding-top: 40px;
}

.leaders-background {
  position: relative;
  width: 100%;
  z-index: 10;
  margin-top: -80px;
  overflow: hidden;
  background-color: #0067AB;
}

.leaders-bg-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  bottom: 0;
  z-index: 1;
  overflow: hidden;
}

/* stylelint-disable-next-line selector-pseudo-element-no-unknown */
.leaders-bg-wrapper ::v-deep(.hero-image-container) {
  height: 100% !important;
  min-height: 100% !important;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  bottom: 0;
}

.leaders-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 100%;
  object-fit: cover;
}


.text-description-wh b {
  font-size: 18px;
  color: #ffffff;
}

.principal-leaders .position {
  font-size: 16px;
  color: rgb(255, 255, 255);
}

.leader-name {
  color: #0067AB;
}

.leaders-content {
  margin-bottom: 40px;
  padding-bottom: 20px;
}

.footer-custom {
  background-color: #f4f4f4;
  color: #333;
  padding: 40px 0;
}

.content-footer .footer-logo {
  max-width: 140px;
}

.footer-links {
  list-style-type: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  text-decoration: none;
  letter-spacing: 0px;
  color: #777777;
  opacity: 1;
}

.footer-links a:hover {
  text-decoration: underline;
}

.contact-info {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  height: 19px;
  text-align: left;
  letter-spacing: 0px;
  color: #0B61AC;
  opacity: 1;
}

.social-icons .v-btn {
  color: #333;
}

.footer-custom .v-btn:hover .v-icon {
  color: #0067AB;
}

.mt-3 {
  margin-top: 1rem !important;
}

.mt-5 {
  margin-top: 3rem !important;
}

.text-center {
  text-align: center;
}

.cert-img {
  margin: 0 5px;
  max-width: 50px;
}

.download-section {
  margin-top: 1rem;
}

.download-icons {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

.download-img {
  margin: 0 10px;
  max-width: 120px;
}

.content-footer {
  gap: 30px;
}

.title-form {
  text-align: left;
  letter-spacing: 0px;
  color: #0B61AC;
}

.input-email {
  margin-top: 25px;
}

.btn-send {
  background: var(--bsc-primary-color) 0% 0% no-repeat padding-box;
  border-radius: 40px;
  opacity: 1;
  width: 212px;
  height: 36px;
}

.certificate {
  gap: 10px;
  width: 100%;
}
</style>
