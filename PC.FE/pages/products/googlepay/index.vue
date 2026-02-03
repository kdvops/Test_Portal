<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Watch } from "vue-facing-decorator";

// IMPORT COMPONENTS
import HeroImage from "~/components/optimized-image/HeroImage.vue";
import IconImage from "~/components/optimized-image/IconImage.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "google-pay-screen",
  components: {
    HeroImage,
    IconImage,
  },
})
export default class GooglePayScreen extends Vue {

  private scriptElements: HTMLElement[] = [];

  /////////////
  // METHODS //
  /////////////

  private loadUIKit() {
    // Limpiar scripts anteriores si existen
    this.cleanupScripts();
    
    // Verificar si ya están cargados
    if (document.querySelector('script[src*="uikit.min.js"]')) {
      return;
    }

    let recaptchaScript = document.createElement("script");
    recaptchaScript.setAttribute(
      "src",
      "https://cdn.jsdelivr.net/npm/uikit@3.16.26/dist/js/uikit.min.js"
    );
    document.head.appendChild(recaptchaScript);
    this.scriptElements.push(recaptchaScript);
    
    let recaptchaScript2 = document.createElement("script");
    recaptchaScript2.setAttribute(
      "src",
      "https://cdn.jsdelivr.net/npm/uikit@3.16.26/dist/js/uikit-icons.min.js"
    );
    document.head.appendChild(recaptchaScript2);
    this.scriptElements.push(recaptchaScript2);
    
    let uikitCSS = document.createElement("link");
    uikitCSS.setAttribute("rel", "stylesheet");
    uikitCSS.setAttribute(
      "href",
      "https://cdn.jsdelivr.net/npm/uikit@3.16.26/dist/css/uikit.min.css"
    );
    document.head.appendChild(uikitCSS);
    this.scriptElements.push(uikitCSS);
  }

  private cleanupScripts() {
    // No limpiar los scripts ya que pueden ser usados por otras páginas
    // Solo limpiar referencias
    this.scriptElements = [];
  }

  public mounted() {
    this.loadUIKit();
  }

  public beforeUnmount() {
    // No limpiar scripts para evitar problemas con otras páginas
  }

  // Watch para cambios de ruta
  @Watch('$route', { immediate: false, deep: true })
  onRouteChange() {
    // Forzar recarga cuando cambia la ruta
    this.$nextTick(() => {
      // Re-inicializar UIKit si es necesario
      if (typeof window !== 'undefined' && (window as any).UIkit) {
        // UIKit ya está cargado, no hacer nada
      } else {
        this.loadUIKit();
      }
    });
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <div>
    <div style="height: 380px;margin-bottom: 100px">
      <HeroImage 
        src="/assets/backgrounds/apple-pay/Hero-banner-google-pay.jpg" 
        alt="Google Pay Banner" 
        :width="1920" 
        :height="380"
        style="object-fit: cover; width: 100%; height: 100%;"
      />
    </div>
    <!-- Prsentacion -->
    <div class="uk-section-small uk-padding-remove-top">
      <div class="uk-container-small uk-margin-auto">
        <h1 class="uk-text-center uk-text-bold d-none" style="color: #00569E;">Paga más cómodo con Google Pay™</h1>
        <div class="uk-card uk-card-body uk-padding uk-padding-remove-top">

          <div class="uk-flex uk-flex-center uk-flex-middle uk-text-center uk-grid-collapse" uk-grid>
            <div class="uk-width-expand@m ">
              <div class=" uk-card  uk-card-body uk-text-center">
                <p class="uk-text-left@m uk-text-center" style="color: #00569E;">Con tus Tarjetas de Crédito
                  y Débito Personales Santa Cruz, puedes pagar tus compras a través de tu teléfono
                  Android.
                </p>
              </div>
            </div>
            <div class="uk-width-auto@m ">
              <div class=" uk-card uk-card-body uk-text-center">
                <a href="#instructivo" class="uk-button uk-button-default uk-border-rounded uk-text-bold bsc-white"
                  style="background:#0961AD;border-radius: 20px 20px 20px 20px; color: #fff;">VINCULA TU
                  TARJETA</a>
                <!-- <a class="btn-azul" href="#instructivo"></a> -->
              </div>
            </div>
          </div>
          <div>
            <div class=" uk-card uk-card-small uk-text-center">
              <img src="/assets/backgrounds/apple-pay/AbanicodetarjetasCreditoDebito.png" alt="Abanico de tarjetas de crédito y débito Banco Santa Cruz" srcset="">
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Beneficios -->
    <div class="uk-section uk-padding-remove-top uk-width-1-1" style="background-color: #FAF9FF;">
      <div style="background-color:#00569E;">
        <h2 class="uk-text-center uk-padding" style="color: #fff;">Beneficios de utilizar la
          Billetera Electrónica
        </h2>
      </div>
      <div class="uk-container-small uk-margin-auto">
        <div class="uk-card-body">
          <div>
            <div class="uk-grid-column-small uk-grid-row-large uk-child-width-1-2@s uk-text-center uk-grid-match"
              uk-grid>
              <div>
                <div class="uk-card uk-card-default uk-card-body uk-text-left card-borde-azul uk-border-rounded"
                  style="border-bottom: 3px solid #00569E;">
                  <IconImage 
                    src="/assets/backgrounds/apple-pay/Grupo-162671.png" 
                    alt="Icono de compras rápidas y seguras"
                    :width="100"
                    :height="100"
                    loading="eager"
                  />
                  <p><strong style="color: #00569E;">Realiza compras de forma rápida y segura.
                    </strong><br>Paga en tiendas físicas y en línea que acepten pagos con esta
                    funcionalidad, con un solo toque manteniendo tus datos personales protegidos.</p>
                </div>
              </div>
              <div>
                <div class="uk-card uk-card-default uk-card-body uk-text-left card-borde-verde uk-border-rounded"
                  style="border-bottom: 3px solid #2D912F;">
                  <IconImage 
                    src="/assets/backgrounds/apple-pay/Grupo-162423.png" 
                    alt="Icono de beneficios de tarjetas"
                    :width="100"
                    :height="100"
                    loading="eager"
                  />
                  <p><strong style="color: #00569E;">Los beneficios de su tarjeta de crédito se
                      mantienen.</strong><br>Seguirá disfrutando de todos los beneficios disponibles
                    con mayor facilidades y seguridad.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagar con Google Pay es simple -->
    <div class="uk-section uk-padding-remove-top uk-width-1-1 uk-padding-remove-bottom">
      <div style="background-color:#2D912F;">
        <h2 class="uk-text-center uk-padding" style="color: #fff;">¡Pagar con <strong>Google Pay™</strong> es
          simple!
        </h2>
      </div>
      <div class="uk-container-small uk-margin-auto uk-padding-small">
        <div>
          <div class="uk-card uk-grid-collapse uk-child-width-1-2@s uk-margin" uk-grid>
            <div class="uk-card-media-left uk-cover-container" style="border-radius: 20px !important;">
              <img src="/assets/backgrounds/apple-pay/googlepay_como_pagar.jpg" alt="Pagar con google play" uk-cover>
              <canvas width="600" height="400"></canvas>
            </div>
            <div>
              <div class="uk-card uk-card-body">
                <dl class="uk-description-list">
                  <div class="uk-grid-small" uk-grid>
                    <div class="uk-width-auto@m uk-text-left">
                      <img src="/assets/backgrounds/apple-pay/Grupo-162779.png" alt="Icono enciende pantalla y desbloquea">
                    </div>
                    <div class="uk-width-expand@m uk-text-left">
                      <dt>
                        <div>
                          <h4 style="color: #00569E;">Enciende tu pantalla y luego
                            desbloquea
                            tu teléfono</h4>
                        </div>
                      </dt>
                      <dd>
                        <ul>
                          <li style="color: #666 !important;">No es necesario abrir la aplicación
                            Google Wallet.</li>
                        </ul>
                      </dd>
                    </div>
                  </div>
                  <div class="uk-grid-small" uk-grid>
                    <div class="uk-width-auto@m uk-text-left">
                      <img src="/assets/backgrounds/apple-pay/Grupo-162780.png" alt="Apple pay contactless">
                    </div>
                    <div class="uk-width-expand@m uk-text-left">
                      <dt>
                        <div>
                          <h4 style="color: #00569E;">Acerca la parte posterior de tu
                            teléfono al lector de pagos</h4>
                        </div>
                      </dt>
                      <dd>
                        <ul>
                          <li style="color: #666 !important;">El lector de pagos debe contar con
                            los ícenos de
                            de Google Pay o lector contactless.</li>
                          <li style="color: #666 !important;">Cuando haya terminado de pagar,
                            aparecerá una marca de verificación
                            azul en
                            la pantalla.</li>
                        </ul>
                      </dd>
                    </div>
                  </div>
                  <div class="uk-grid-small" uk-grid>
                    <div class="uk-width-auto@m uk-text-left">
                      <img src="/assets/backgrounds/apple-pay/Grupo-162781.png" alt="Icono PIN o firma">
                    </div>
                    <div class="uk-width-expand@m uk-text-left">
                      <dt>
                        <div>
                          <h4 style="color: #00569E;">De ser necesario ingresa el PIN o una
                            firma.</h4>
                        </div>
                      </dt>

                    </div>
                  </div>

                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Intructivo -->
    <div id="instructivo" class="uk-section-default uk-padding-remove-top">
      <div class="uk-section uk-light uk-background-cover" :style="`background-image: url('/assets/backgrounds/apple-pay/Trazado-84204.jpg')`">
        <div>
          <div class="uk-flex uk-flex-center uk-flex-around uk-flex-top uk-text-top uk-text-center uk-grid-collapse"
            uk-grid>
            <div class="uk-width-1-3@m uk-padding-remove-vertical">
              <div class="uk-card uk-card-body uk-padding-small">
                <div class="uk-card uk-card-body uk-padding-remove-top uk-text-left@m">
                  <img src="/assets/backgrounds/apple-pay/GPay_Acceptance_Mark_03_Reverse.png" alt="Vincular tarjetas Santa Cruz con Google Pay" srcset="">
                  <h3 class="uk-text-left@m uk-text-center uk-text-large">
                    Cómo vincular mis Tarjetas Santa Cruz con Google Pay™
                  </h3>
                </div>
              </div>
            </div>
            <div class="uk-width-expand@m uk-padding-remove-vertical">
              <div class="uk-card uk-card-body uk-text-center">
                <div class="uk-position-relative uk-visible-toggle uk-light " tabindex="-1" uk-slider>
                  <div class="uk-slider-items uk-child-width-1-2@m">
                    <div class="uk-padding-small">
                      <div class="uk-panel">
                        <img src="/assets/backgrounds/apple-pay/Grupo-162935.png" height="766" alt="Apple pay icono 1">
                      </div>
                    </div>
                    <div class="uk-padding-small">
                      <div class="uk-panel">
                        <img src="/assets/backgrounds/apple-pay/Grupo-162936.png" height="766" alt="Apple pay icono 2">
                      </div>
                    </div>
                    <div class="uk-padding-small">
                      <div class="uk-panel">
                        <img src="/assets/backgrounds/apple-pay/Grupo-162937.png" height="766" alt="Apple pay icono 3">
                      </div>
                    </div>
                  </div>

                  <a class="uk-position-center-left uk-position-small " href="#!" uk-slidenav-previous
                    uk-slider-item="previous"></a>
                  <a class="uk-position-center-right uk-position-small " href="#!" uk-slidenav-next
                    uk-slider-item="next"></a>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Terminos y condiciones -->
    <div class="uk-section">
      <div class="uk-container-small uk-margin-auto">
        <div class="uk-card-body">
          <div>
            <div class="uk-text-center ">
              <div>
                <div class="uk-card uk-card-default uk-card-body card-borde-azul"
                  style="border-radius: 20px; border-bottom: 3px solid #00569E;">
                  <img src="/assets/backgrounds/apple-pay/Grupo-162671.png" alt="Apple pay icono terminos" srcset="">
                  <h3 style="color: #00569E;">Conoce los términos y condiciones de
                    Google Pay™</h3>
                  <div class="uk-card uk-card-footer uk-text-center">
                    <a href="https://stgpwebsc.blob.core.windows.net/bsc-pweb-prod/sections/6716c157ffdfa84604214eb1/2911794-1729544535259.pdf?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2026-01-12T02:04:48Z&st=2025-01-31T18:04:48Z&spr=https&sig=qCkGdfW9toWR6zKeR2RbqW67PigOvBjSWcz%2BcdGgPIY%3D"
                      class="uk-button uk-button-default uk-border-rounded uk-text-bold bsc-white"
                      style="background:#0961AD;border-radius: 20px 20px 20px 20px; color: #fff;">VER
                      PDF</a>

                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preguntas frecuentes -->
    <div class="uk-section uk-padding-remove-vertical uk-width-1-1" style="background-color: #FAF9FF;">
      <div class="uk-container-large uk-margin-auto">
        <div class="uk-card-body">
          <div class="uk-card-body uk-card-default uk-border-rounded card-round" style="border-radius: 20px;">
            <div class="uk-card uk-card-body">
              <div class="uk-flex uk-flex-center uk-flex-middle" uk-grid>
                <img src="/assets/backgrounds/apple-pay/Grupo-227.png" alt="Apple pay icono faq" srcset="">
                <h2 class="uk-text-center" style="color: #00569E;">Preguntas
                  frecuentes
                </h2>
              </div>
            </div>
            <div>
              <div>
                <div class="uk-grid-column-small uk-grid-row-large uk-child-width-1-2@s uk-grid-match" uk-grid>
                  <div>
                    <ul uk-accordion="multiple: true">
                      <li
                        class="uk-open uk-card uk-card-default uk-card-body uk-text-left card-borde-azul uk-border-rounded"
                        style="border-bottom: 3px solid #00569E;">
                        <a class="uk-accordion-title" style="color: #00569E;" href="#!">¿Cómo funciona
                          Google Pay?</a>
                        <div class="uk-accordion-content">
                          <p>Google Pay es la forma más rápida y sencilla de pagar en millones de
                            sitios. Añade una tarjeta y podrás:
                          <ul>
                            <li>Pagar en tiendas físicas.</li>
                          </ul>
                          <ul>
                            <li>Pagar en apps y webs.</li>
                          </ul>
                          </p>
                        </div>
                      </li>
                      <li class="uk-card uk-card-default uk-card-body uk-text-left card-borde-azul uk-border-rounded"
                        style="border-bottom: 3px solid #00569E;">
                        <a class="uk-accordion-title" style="color: #00569E;" href="#!">¿Cómo se
                          configura Google Pay?</a>
                        <div class="uk-accordion-content">
                          <p>Solo necesitas unos minutos para empezar a utilizar Google Pay:
                          <ul>
                            <li>Descarga la app desde Google Play o App Store o visita
                              pay.google.com.</li>
                          </ul>
                          <ul>
                            <li>Inicia sesión en tu Cuenta de Google y añade un método de pago.
                              Si quieres pagar con Google Pay en tiendas, comprueba si tu
                              teléfono
                              tiene NFC.</li>
                          </ul>
                          <ul>
                            <li>¡Listo! Ya puedes pagar con Google Pay.</li>
                          </ul>
                          </p>
                        </div>
                      </li>
                      <li class="uk-card uk-card-default uk-card-body uk-text-left card-borde-azul uk-border-rounded"
                        style="border-bottom: 3px solid #00569E;">
                        <a class="uk-accordion-title" style="color: #00569E;" href="#!">¿Debo añadir
                          dinero a Google Pay?</a>
                        <div class="uk-accordion-content">
                          <p>No tienes que añadir dinero a Google Pay para pagar. Lo único que
                            debes hacer es añadir un método de pago, como una tarjeta de crédito
                            o de débito. Cuando usas Google Pay, es como si usaras tu tarjeta de
                            forma habitual.</p>
                        </div>
                      </li class="uk-card uk-card-default uk-card-body uk-text-left card-borde-azul uk-border-rounded"
                        style="border-bottom: 3px solid #00569E;">
                    </ul>
                  </div>
                  <div>
                    <ul uk-accordion="multiple: true">
                      <li class="uk-card uk-card-default uk-card-body uk-text-left card-borde-azul uk-border-rounded"
                        style="border-bottom: 3px solid #00569E;">
                        <a class="uk-accordion-title" style="color: #00569E;" href="#!">¿Dónde puedo usar
                          Google Pay?</a>
                        <div class="uk-accordion-content">
                          <p>Puedes usar Google Pay en millones de tiendas físicas, apps y webs. A
                            continuación, te explicamos cómo saber dónde puedes pagar con Google
                            Pay:
                          <ul>
                            <li><strong>En tiendas</strong><br>
                              Si una tienda acepta los pagos contactless, puedes pagar con tu
                              teléfono. También puedes buscar uno de estos símbolos, aunque no
                              es necesario ver el logotipo de Google Pay para poder usarlo en
                              tiendas:
                              <img
                                src="/assets/backgrounds/apple-pay/Captura-de-Pantalla-2024-05-06-a-las-3.28.48-p.-m..jpg" alt="Icono contactless"
                                width="150">
                            </li>
                          </ul>

                          <ul>
                            <li><strong>En apps y webs</strong> <br>
                              Paga con Google Pay en cualquier web o app donde veas alguno de
                              estos botones de compra.
                              <img
                                src="/assets/backgrounds/apple-pay/Captura-de-Pantalla-2024-05-06-a-las-3.29.04-p.-m..jpg" alt="Icono contactless apple pay"
                                width="150">
                            </li>
                          </ul>

                          </p>
                        </div>
                      </li>
                      <li class="uk-card uk-card-default uk-card-body uk-text-left card-borde-azul uk-border-rounded"
                        style="border-bottom: 3px solid #00569E;">
                        <a class="uk-accordion-title" style="color: #00569E;" href="#!">¿Cómo usar Google
                          Pay?</a>
                        <div class="uk-accordion-content">
                          <ul>
                            <li>
                              <strong>Pagar en tiendas o en el transporte público </strong>
                              <br>

                              Acerca la parte de atrás de tu teléfono al terminal de pago
                              durante unos segundos.
                              Sigue las instrucciones que aparecen en la pantalla del terminal
                              de pago, de requerirlo introducir el PIN de tu tarjeta en el
                              terminal de

                            </li>
                          </ul>
                          <ul>
                            <li>
                              <strong>Pagar en apps y webs</strong> <br>

                              En el momento del Checkout, haz click en el botón de Google Pay.
                              Si se te pide, selecciona una tarjeta entre tus diferentes
                              método de pago e introduce tu dirección de envío.

                            </li>
                          </ul>
                        </div>
                      </li>
                      <li class="uk-card uk-card-default uk-card-body uk-text-left card-borde-azul uk-border-rounded"
                        style="border-bottom: 3px solid #00569E;">
                        <a class="uk-accordion-title" style="color: #00569E;" href="#!">¿Hasta qué punto
                          es seguro Google Pay?</a>
                        <div class="uk-accordion-content">
                          <p>Google Pay utiliza varias capas de seguridad para proteger tus datos
                            de pago, así como una de las infraestructuras de seguridad más
                            avanzadas del mundo para que tu cuenta esté siempre protegida.
                            Cuando pagas en tiendas físicas, Google Pay no comparte el número de
                            tu tarjeta, por lo que tu información está protegida. </p>
                        </div>
                      </li class="uk-card uk-card-default uk-card-body uk-text-left card-borde-azul">
                    </ul>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Solicita tu tarjeta -->
    <div class="uk-section">
      <div class="uk-container-small uk-margin-auto">
        <div class="uk-card-body">
          <div class="uk-card card-calor uk-padding"
            style="border-radius: 20px; background: transparent radial-gradient(closest-side at 50% 75%, #2C90E6 0%, #159DE4 0%, var(--bsc-primary-color) 100%) 0% 0% no-repeat padding-box;">
            <div class="uk-flex uk-flex-center uk-flex-middle uk-flex-between uk-text-center uk-grid-collapse" uk-grid>
              <div class="uk-width-expand@m ">
                <div class=" uk-card uk-card-body uk-text-center uk-padding-small">
                  <h2 class="uk-text-left@m uk-text-center uk-margin-remove-bottom" style="color: #fff;">
                    Solicita tu tarjeta de Crédito
                  </h2>
                  <p class="uk-text-left@m uk-text-center uk-margin-remove-top" style="color: #fff;">y
                    disfruta de los
                    beneficios que te ofrece.
                  </p>
                </div>
              </div>
              <div class="uk-width-auto@m">
                <div class=" uk-card uk-card-body uk-text-center">
                  <v-btn to="/forms/66db55c2915bc966f2b144f7"
                    class="uk-button uk-button-default uk-border-rounded uk-text-bold bsc-white"
                    style="background:#2D912F; border-radius: 20px; border-color: #2D912F; color: #fff;">APLICA
                    AHORA</v-btn>
                </div>
              </div>
            </div>
            <div>
              <div class=" uk-card uk-text-center">
                <img src="/assets/backgrounds/apple-pay/AbanicodetarjetasCreditoDebito.png" alt="Apple pay abanico de tarjetas de credito y debito" srcset="">
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
<style>
uk-section {
  padding-top: 0;
}

.uk-container {
  max-width: 100% !important;
  padding: 0 !important;
}
:root{
  --bsc-primary-color: #12499b;
  --v-theme-on-surface: --bsc-primary-color;
}
</style>
