<!-- SCRIPT TEMPLATE -->
<script lang="ts">

// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

// IMPORT OPTIMIZED IMAGE COMPONENTS
import IconImage from "~/components/optimized-image/IconImage.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'app-footer-component',
  components: {
    IconImage,
  },
})

// EXPORT FOOTER COMPONENT
export default class AppFooterComponent extends Vue { }
</script>

<!-- HTML TEMPLATE -->
<template>
  <div class="container-footer">
    <v-container class="pt-0">
      <v-row class="content-footer" no-gutters>
        <v-col cols="12" md="3">
          <IconImage 
            src="/assets/icons/logo.svg" 
            alt="Logo Banco Santa Cruz" 
            :width="140" 
            :height="50"
            container-class="footer-logo my-5"
          />
          <ul class="footer-links">
            <li><v-btn to="/productos/tarjetas/tarjetas-de-credito" variant="text">Para ti</v-btn></li>
            <li><v-btn to="/empresa" variant="text">Para tu Empresa</v-btn></li>
            <li><v-btn to="/negocio" variant="text">Mi Negocio</v-btn></li>
            <li><v-btn to="/beneficios" variant="text">Beneficios</v-btn></li>
            <li><v-btn to="/canales" variant="text">Canales</v-btn></li>
            <li><v-btn to="/promociones" variant="text">Promociones</v-btn></li>
            <li><v-btn to="/podcast/season/temporada-1" variant="text">Podcast</v-btn></li>
            <li><v-btn to="/seguros" variant="text">Seguros</v-btn></li>
            <li><v-btn to="/financieramente" variant="text">Financieramente</v-btn></li>
            <li><v-btn to="/sobre-nosotros/categoria/tarifarios-y-tasas/tarifario-de-productos-y-servicios-y-tasas" variant="text">Tarifarios y Tasas</v-btn>
            </li>
            <li><v-btn to="/sobre-nosotros/historia" variant="text">Sobre Nosotros</v-btn></li>
          </ul>
        </v-col>
        <v-col cols="12" md="3" class="text-center mt-5">
          <h3 class="title-form">Contáctenos</h3>
          <v-form>
            <v-text-field class="input-email" readonly density="compact" rounded="xl" variant="solo" label="Tu email"
              outlined></v-text-field>
            <v-textarea class="input-message" readonly density="compact" rounded="xl" variant="solo" label="Tu mensaje"
              outlined></v-textarea>
            <v-btn color="primary" readonly class="mt-3 btn-send">ENVIAR</v-btn>
          </v-form>
          <hr class="form-line">
          <div class="mt-3 contact-info">
            <v-icon class="mr-2">mdi-phone</v-icon> 809 726 1000
          </div>
          <hr class="form-line">
          <v-btn to="/locations" class="mt-3 py-4 mx-auto contact-info" variant="text">
            <v-icon class="mr-2">mdi-map-marker</v-icon> Encuéntranos
          </v-btn>
        </v-col>

        <v-col cols="12" md="5" class="text-center align-content-center">
          <div class="certificate d-flex flex-row justify-center align-center">
            <a href="#" class="cert-link">
              <img 
                src="/assets/backgrounds/Certificado-Sostenibilidad.jpg" 
                alt="Certificado de Sostenibilidad" 
                class="cert-img"
                loading="lazy"
              />
            </a>
            <a href="https://sb.gob.do/supervisados/entidades-de-intermediacion-financiera/banco-santa-cruz" target="_blank" class="cert-link" rel="noopener">
              <img 
                src="/assets/backgrounds/SB-Entidad-Autorizada-Footer.png" 
                alt="Superintendencia de Bancos - Entidad Autorizada" 
                class="cert-img"
                loading="lazy"
              />
            </a>
            <a href="https://certificaciones.uaf.gob.do/certificaciones_so_view.php?editid1=222" target="_blank" class="cert-link"  rel="noopener">
              <img 
                src="/assets/backgrounds/Image-5.png" 
                alt="Certificación UAF" 
                class="cert-img"
                loading="lazy"
              />
            </a>
            <a href="https://stgpwebsc.blob.core.windows.net/bsc-pweb-prod/sections/67478a763896f64580f5f24e/5147841-1732741750519.pdf?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2026-01-12T02:04:48Z&st=2025-01-31T18:04:48Z&spr=https&sig=qCkGdfW9toWR6zKeR2RbqW67PigOvBjSWcz%2BcdGgPIY%3D" target="_blank" class="cert-link" rel="noopener">
              <img 
                src="/assets/backgrounds/ServiceProviderBadgelow.png" 
                alt="Service Provider Badge" 
                class="cert-img"
                loading="lazy"
              />
            </a>
          </div>
          <div class="my-8">
            <div class="w-100 mb-4">
              <v-divider thickness="2" color="grey" inset></v-divider>
            </div>
            <div class="social-icons d-flex flex-row justify-center w-100 my-6">
              <v-btn href="https://www.facebook.com/bancosantacruzrd" target="_blank" class="social-icon-btn" color="#0167AB" icon>
                <v-icon size="20" color="white">mdi-facebook</v-icon>
              </v-btn>
              <v-btn href="https://www.instagram.com/BancoSantaCruzRD/" target="_blank" class="social-icon-btn" color="#0167AB" icon>
                <v-icon size="20" color="white">mdi-instagram</v-icon>
              </v-btn>
              <v-btn href="https://x.com/BSC_RD" target="_blank" class="social-icon-btn" color="#0167AB" icon>
                <v-icon size="20" color="white">mdi-twitter</v-icon>
              </v-btn>
              <v-btn href="https://www.youtube.com/channel/UClPGISKNKCTFuAH6W8iUKug" target="_blank" class="social-icon-btn" color="#0167AB" icon>
                <v-icon size="20" color="white">mdi-youtube</v-icon>
              </v-btn>
              <v-btn href="https://www.linkedin.com/company/banco-santa-cruz-s.a./" target="_blank" class="social-icon-btn" color="#0167AB" icon>
                <v-icon size="20" color="white">mdi-linkedin</v-icon>
              </v-btn>
            </div>
            <div class="w-100 mt-4">
              <v-divider thickness="2" color="grey" inset></v-divider>
            </div>
          </div>
          <div class="download-section text-center">
            <h3 class="mt-6 mb-5 download-title">Descarga o actualiza tu nueva App BSC</h3>
            <div class="download-icons d-flex justify-content-center align-center">
              <a href="https://apps.apple.com/do/app/app-bsc/id1341044667?l=en-GB" target="_blank" class="download-link" rel="noopener">
                <img 
                  src="/assets/icons/Icono_appstore.svg" 
                  alt="Descargar en App Store" 
                  class="download-img"
                  loading="lazy"
                />
              </a>
              <a href="https://play.google.com/store/apps/details?id=dom.com.santacruz" target="_blank" class="download-link" rel="noopener">
                <img 
                  src="/assets/icons/Icono_googleplay.svg" 
                  alt="Descargar en Google Play" 
                  class="download-img"
                  loading="lazy"
                />
              </a>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <div class="copyright text-center mt-0">
      <p>© 2024. Banco Santa Cruz RD. Todos los Derechos Reservados.</p>
    </div>
  </div>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
}

.footer-custom {
  color: #333;
  padding: 40px 0;
}

.container-footer {
  background-color: #faf9ff !important;
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
  font-size: 13px;
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
  color: #0B61AC;
  height: 19px;
  text-align: left;
  letter-spacing: 0px;
  opacity: 1;
}

.social-icons {
  gap: 20px;
}

.social-icon-btn {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  border-radius: 50% !important;
  background: #0167AB !important;
  color: white !important;
  transition: transform 0.2s ease, background-color 0.2s ease;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.social-icon-btn:hover {
  transform: scale(1.1);
  background: #015a94 !important;
}

.social-icon-btn .v-icon {
  color: white !important;
  width: 20px !important;
  height: 20px !important;
  font-size: 20px !important;
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

.cert-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
  transition: transform 0.2s ease;
  text-decoration: none;
}

.cert-link:hover {
  transform: scale(1.05);
}

.cert-img {
  width: 70px;
  height: auto;
  max-width: 70px;
  object-fit: contain;
  display: block;
}

.download-section {
  margin-top: 0;
}

.download-title {
  letter-spacing: 0px;
  color: #0B61AC;
  font-weight: 700;
  font-size: 1.2rem;
  opacity: 1;
  margin-bottom: 1.5rem !important;
}

.download-icons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 0.5rem;
}

.download-link:hover {
  transform: scale(1.05);
}

.download-link {
  display: inline-block;
  width: 180px;
  max-width: 180px;
  transition: transform 0.2s ease;
}

.download-link:hover {
  transform: scale(1.05);
}

.download-img {
  width: 180px !important;
  max-width: 180px !important;
  min-width: 180px !important;
  height: auto !important;
  display: block !important;
  object-fit: contain !important;
}

.content-footer {
  gap: 30px;
  margin-top: 0;
}

.title-form {
  text-align: left;
  letter-spacing: 0px;
  color: #0B61AC;
}

.input-email {
  margin-top: 25px;
}

.input-message {}

.btn-send {
  background: var(--bsc-primary-color);
  border-radius: 40px;
  opacity: 1;
  width: 212px;
  height: 36px;
}

.certificate {
  gap: 20px;
  width: 100%;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  padding: 1rem 0;
  align-items: flex-start;
}

.copyright {
  padding: 1%;
  background: var(--bsc-primary-color);
  opacity: 1;
  color: white;
}

.form-line {
  width: 260px;
  height: 0;
  margin: auto;
  margin-top: 5%;
  border: 1px solid #E8E8E8;
}
</style>
