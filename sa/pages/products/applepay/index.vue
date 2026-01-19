<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Watch } from "vue-facing-decorator";

// IMPORT COMPONENTS
import HeroImage from "~/components/optimized-image/HeroImage.vue";
import IconImage from "~/components/optimized-image/IconImage.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "apple-pay-screen",
  components: {
    HeroImage,
    IconImage,
  },
})
export default class ApplePayScreen extends Vue {

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
        src="/assets/backgrounds/apple-pay/Hero-banner-home-2.jpg" 
        alt="Apple Pay Banner" 
        :width="1920" 
        :height="380"
        style="object-fit: cover; width: 100%; height: 100%;"
      />
    </div>
    <!-- Prsentacion -->
    <div class="uk-section-small uk-padding-remove-top">
      <div class="uk-container-small uk-margin-auto">
        <h1 class="uk-text-center uk-text-bold d-none" style="color: #00569E;">Paga más cómodo con Apple Pay™</h1>
        <div class="uk-card uk-card-body uk-padding uk-padding-remove-top">

          <div class="uk-flex uk-flex-center uk-flex-middle uk-text-center uk-grid-collapse" uk-grid>
            <div class="uk-width-expand@m ">
              <div class=" uk-card  uk-card-body uk-text-center">
                <p class="uk-text-left@m uk-text-center" style="color: #00569E;">Con tus Tarjetas de Crédito
                  y Débito Personales
                  Santa
                  Cruz,
                  puedes pagar tus
                  compras a través de tu
                  dispositivo Apple.
                </p>
              </div>
            </div>
            <div class="uk-width-auto@m ">
              <div class=" uk-card uk-card-body uk-text-center">
                <a href="#instructivo" class="uk-button uk-button-default uk-border-rounded uk-text-bold bsc-white"
                  style="background:#0961AD;border-radius: 20px 20px 20px 20px; color: #fff;">VINCULA TU
                  TARJETA</a>
                <!-- <a class="btn-azul" href="#!"="#instructivo"></a> -->
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
                  <p><strong style="color: #00569E;">Realiza compras de forma rápida y
                      segura.</strong><br> Paga en tiendas
                    físicas y
                    en línea que acepten pagos con esta funcionalidad, con un solo toque manteniendo
                    tus
                    datos personales protegidos.</p>
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
                  <p><strong style="color: #00569E;">Continúa disfrutando los beneficios de tus
                      tarjetas.</strong><br> Ahora a
                    través
                    de este canal con mayor facilidad y seguridad.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagar con Appple Pay es simple -->
    <div class="uk-section uk-padding-remove-top uk-width-1-1">
      <div style="background-color:#2D912F;">
        <h2 class="uk-text-center uk-padding" style="color: #fff;">¡Pagar con <strong>Apple Pay</strong> es simple!
        </h2>
      </div>
      <div class="uk-container-small uk-margin-auto">
        <div>
          <div class="uk-grid-column-small uk-grid-row-large uk-child-width-1-3@m uk-text-center uk-grid-match "
            uk-grid>
            <div>
              <div class="uk-card uk-text-center">
                <div class="uk-card-small">
                  <img src="/assets/backgrounds/apple-pay/Grupo-162779.png" alt="Icono apple pay buscar" srcset="">
                </div>
                <img class="uk-padding" src="/assets/backgrounds/apple-pay/lector-contactless.png" alt="Icono lector contactless" srcset="">
                <div class="uk-card-small">
                  <p style="color: #00569E;">Busca un lector contactless que tenga uno estos de estos
                    símbolos.</p>
                </div>
              </div>
            </div>
            <div>
              <div class="uk-card uk-text-center">
                <div class="uk-card-small">
                  <img src="/assets/backgrounds/apple-pay/Grupo-162780.png" alt="Icono apple pay telefono" srcset="">
                </div>
                <img class="uk-padding" src="/assets/backgrounds/apple-pay/lector-contactless-2.png" alt="Icono apple pay contactless" srcset="">
                <div class="uk-card-small">
                  <p style="color: #00569E;">En tu iPhone si tiene Face ID, presiona dos veces el botón
                    lateral; si tu iPhone
                    tiene Touch ID, presiona dos veces el botón de inicio y con tu Apple Watch
                    presiona
                    dos veces el botón lateral.</p>
                </div>
              </div>
            </div>
            <div>
              <div class="uk-card uk-text-center">
                <div class="uk-card-small">
                  <img src="/assets/backgrounds/apple-pay/Grupo-162781.png" alt="Icono apple pay telefono 1" srcset="">
                </div>
                <img class="uk-padding" src="/assets/backgrounds/apple-pay/dispositivo-contactless.png" alt="Icono apple pay contactless 1"
                  srcset="">
                <div class="uk-card-small">
                  <p style="color: #00569E;">Sostén tu dispositivo cerca del lector contactless hasta que
                    veas “Listo” y una
                    marca
                    de verificación en la pantalla.</p>
                </div>
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
          <ul class="uk-subnav uk-subnav-pill uk-margin-remove uk-flex-left@m uk-flex-center uk-padding"
            uk-switcher="animation: uk-animation-slide-left-medium, uk-animation-slide-right-medium">
            <li><a class="uk-border-rounded" href="#!"><img
                  src="/assets/backgrounds/apple-pay/Wallet_App_icon_iOS_12-1.png" alt="Icono apple pay wallet" srcset=""></a>
            </li>
            <li><a class="uk-border-rounded" href="#!"><img src="/assets/backgrounds/apple-pay/Grupo-162979.png" alt="Fondo apple pay instructivo"
                  srcset=""></a>
            </li>
          </ul>

          <div class="uk-switcher">
            <div class="uk-flex uk-flex-center uk-flex-around uk-flex-top uk-text-top uk-text-center  uk-grid-collapse"
              uk-grid>
              <div class="uk-width-1-3@m uk-padding-remove-vertical">
                <div class="uk-card uk-card-body uk-padding-small">
                  <div class="uk-card uk-card-body uk-padding-remove-top uk-text-left@m">
                    <h3 class="uk-text-left@m uk-text-center uk-text-large">
                      Vinculación de las tarjetas disponible desde Apple Wallet App
                    </h3>
                  </div>
                </div>
              </div>
              <div class="uk-width-expand@m uk-padding-remove-vertical">
                <div class=" uk-card uk-text-center">
                  <div class="uk-position-relative uk-visible-toggle uk-light" tabindex="-1" uk-slider>

                    <div class="uk-slider-items uk-child-width-1-2@m">
                      <div>
                        <div class="uk-panel">
                          <img src="/assets/backgrounds/apple-pay/Grupo-162973.png" height="766" alt="Fondo carousel apple pay 1">
                          <div class="uk-position-center uk-panel">

                          </div>
                        </div>
                      </div>
                      <div>
                        <div class="uk-panel">
                          <img src="/assets/backgrounds/apple-pay/Grupo-162974.png" height="766" alt="Fondo carousel apple pay 2">
                          <div class="uk-position-center uk-panel">
                          </div>
                        </div>
                      </div>
                      <div>
                        <div class="uk-panel">
                          <img src="/assets/backgrounds/apple-pay/Grupo-162975.png" height="766" alt="Fondo carousel apple pay 2">
                          <div class="uk-position-center uk-panel">

                          </div>
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
            <div class="uk-flex uk-flex-center uk-flex-around uk-flex-top uk-text-top uk-text-center uk-grid-collapse"
              uk-grid>
              <div class="uk-width-1-3@m uk-padding-remove-vertical">
                <div class="uk-card uk-card-body uk-padding-small">
                  <div class="uk-card uk-card-body uk-padding-remove-top uk-text-left@m">
                    <h3 class="uk-text-left@m uk-text-center uk-text-large">
                      Vinculación a Apple Wallet desde tu App BSC en la sección Billetera Digital.
                    </h3>
                  </div>
                </div>
              </div>
              <div class="uk-width-expand@m uk-padding-remove-vertical">
                <div class=" uk-card uk-text-center">
                  <div class="uk-position-relative uk-visible-toggle uk-light" tabindex="-1" uk-slider>

                    <div class="uk-slider-items uk-child-width-1-2@m">
                      <div>
                        <div class="uk-panel">
                          <img src="/assets/backgrounds/apple-pay/Grupo-162976.png" height="766" alt="Fondo carousel apple pay 3">
                          <div class="uk-position-center uk-panel">

                          </div>
                        </div>
                      </div>
                      <div>
                        <div class="uk-panel">
                          <img src="/assets/backgrounds/apple-pay/Grupo-162977.png" height="766" alt="Fondo carousel apple pay 4">
                          <div class="uk-position-center uk-panel">

                          </div>
                        </div>
                      </div>
                      <div>
                        <div class="uk-panel">
                          <img src="/assets/backgrounds/apple-pay/Grupo-162978.png" height="766" alt="Fondo carousel apple pay 5">
                          <div class="uk-position-center uk-panel">

                          </div>
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
                  <img src="/assets/backgrounds/apple-pay/Grupo-162671.png" alt="Icono apple pay terminos y condiciones" srcset="">
                  <h3 style="color: #00569E;">Conoce los términos y condiciones de
                    Apple Pay</h3>
                  <div class=" uk-card uk-card-footer uk-text-center">
                    <a href="https://stgpwebsc.blob.core.windows.net/bsc-pweb-prod/sections/6716c157ffdfa84604214eb1/10912135-1729544535269.pdf?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2026-01-12T02:04:48Z&st=2025-01-31T18:04:48Z&spr=https&sig=qCkGdfW9toWR6zKeR2RbqW67PigOvBjSWcz%2BcdGgPIY%3D"
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
                <img src="/assets/backgrounds/apple-pay/Grupo-227.png" alt="Icono apple pay faq" srcset="">
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
                        <a class="uk-accordion-title" style="color: #00569E;" href="#!">¿Qué es y cómo
                          uso Apple Pay?</a>
                        <div class="uk-accordion-content">
                          <p>• Apple Pay es una forma nueva e innovadora de realizar compras
                            sin
                            contacto utilizando tu dispositivo Apple elegible. Puede
                            utilizar
                            una tarjeta de Crédito o Débito de Banco Santa Cruz con Apple
                            Pay
                            para pagar bienes y servicios en comercios que acepten pagos sin
                            contacto.
                            <br>
                            • Además, Apple Pay también le permite realizar compras dentro
                            de la
                            aplicación en tu iPhone o iPad elegible dondequiera que se
                            encuentre
                            el ícono “Apple Pay” en la página de pago en línea.
                          </p>
                        </div>
                      </li>
                      <li class="uk-card uk-card-default uk-card-body uk-text-left card-borde-azul uk-border-rounded"
                        style="border-bottom: 3px solid #00569E;">
                        <a class="uk-accordion-title" style="color: #00569E;" href="#!">¿Qué tan seguro
                          es Apple Pay?</a>
                        <div class="uk-accordion-content">
                          <p>Apple Pay es más seguro que utilizar una tarjeta física de
                            crédito,
                            débito o prepago. Se requiere Face ID, Touch ID o tu contraseña
                            para
                            realizar compras en tu iPhone, Apple Watch, Mac o iPad. Tu
                            número de
                            tarjeta e identidad no se comparten con los comerciantes y tus
                            números de tarjeta reales no se almacenan en tu dispositivo ni
                            en
                            los servidores de Apple.
                            Cuando pagas en tiendas, ni Apple ni tu dispositivo enviarán tu
                            número de tarjeta real a los comerciantes. Cuando pagas en línea
                            en
                            Safari o en aplicaciones, el comerciante solo recibirá
                            información
                            que tú autorices para completar su pedido, como tu nombre,
                            dirección
                            de correo electrónico y direcciones de facturación y envío.
                            Cuando pagas con una tarjeta de débito o crédito, Apple no
                            guarda
                            información de la transacción que pueda vincularse a usted. Y
                            cuando
                            usas Apple Cash, la información se almacena solo para resolución
                            de
                            problemas, prevención de fraude y fines regulatorios.</p>
                        </div>
                      </li>
                      <li class="uk-card uk-card-default uk-card-body uk-text-left card-borde-azul uk-border-rounded"
                        style="border-bottom: 3px solid #00569E;">
                        <a class="uk-accordion-title" style="color: #00569E;" href="#!">¿Cómo configuro
                          Apple Pay?</a>
                        <div class="uk-accordion-content">
                          <p>Es sencillo. Simplemente agregua una tarjeta de crédito, débito o
                            prepago a la aplicación Wallet en tu iPhone, luego elige agregar
                            la
                            tarjeta a cualquier otro dispositivo Apple que deseas usar con
                            Apple
                            Pay. Funciona en iPhone, Apple Watch, Mac y iPad. Si actualizas
                            a un
                            nuevo iPhone, puedes transferir automáticamente tus tarjetas al
                            nuevo dispositivo en un solo paso.</p>
                        </div>
                      </li class="uk-card uk-card-default uk-card-body uk-text-left card-borde-azul uk-border-rounded"
                        style="border-bottom: 3px solid #00569E;">
                    </ul>
                  </div>
                  <div>
                    <ul uk-accordion="multiple: true">
                      <li class="uk-card uk-card-default uk-card-body uk-text-left card-borde-azul uk-border-rounded"
                        style="border-bottom: 3px solid #00569E;">
                        <a class="uk-accordion-title" style="color: #00569E;" href="#!">¿Puedo consultar
                          el saldo de mi
                          tarjeta?</a>
                        <div class="uk-accordion-content">
                          <p>Sí. Conecta tu cuenta de tarjeta de Crédito Santa Cruz elegible a
                            la
                            tarjeta asociada que usa con Apple Pay para ver de forma segura
                            los
                            detalles de tu cuenta de tarjeta directamente en Wallet,
                            incluidos
                            los saldos de la tarjeta y hasta dos años de historial de
                            transacciones. Para conectar una cuenta, abra Wallet, selecciona
                            tu
                            tarjeta, toca y selecciona “Detalles” de la tarjeta. Luego toca
                            obtener saldo y actividad de la cuenta y sigue los pasos que
                            aparecen en pantalla.</p>
                        </div>
                      </li>
                      <li class="uk-card uk-card-default uk-card-body uk-text-left card-borde-azul uk-border-rounded"
                        style="border-bottom: 3px solid #00569E;">
                        <a class="uk-accordion-title" style="color: #00569E;" href="#!">¿Tiene un coste
                          adicional utilizar
                          Apple
                          Pay?</a>
                        <div class="uk-accordion-content">
                          <p>No. Apple no cobra ninguna tarifa cuando pagas con Apple Pay, ya
                            sea
                            en tiendas, en línea o en aplicaciones. Y Apple no cobra
                            intereses
                            ni tarifas cuando usas Apple Pay Later.</p>
                        </div>
                      </li>
                      <li class="uk-card uk-card-default uk-card-body uk-text-left card-borde-azul uk-border-rounded"
                        style="border-bottom: 3px solid #00569E;">
                        <a class="uk-accordion-title" style="color: #00569E;" href="#!">¿Puedo usar Apple
                          Pay en el
                          extranjero?</a>
                        <div class="uk-accordion-content">
                          <p>Apple Pay funciona en países y regiones que admiten pagos sin
                            contacto. Apple Pay Later está disponible solo para solicitantes
                            elegibles cuando compran en comercios ubicados en los Estados
                            Unidos.</p>
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
                <img src="/assets/backgrounds/apple-pay/AbanicodetarjetasCreditoDebito.png" alt="Abanico de tarjetas apple pay" srcset="">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.uk-section {
  padding-top: 0;
}

.uk-container {
  max-width: 100% !important;
  padding: 0 !important;
}
</style>
