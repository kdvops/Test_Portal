<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: "/productos/puntos",
});

import { defineComponent } from "vue";
import HeroImage from "~/components/optimized-image/HeroImage.vue";
import IconImage from "~/components/optimized-image/IconImage.vue";

// Las imágenes ahora se cargan directamente desde las rutas públicas
const GesturLogo = "/assets/backgrounds/Logo-Gestur.png";
const AgencyLogo = "/assets/backgrounds/Logo-Agencia-Viajes-Taveras.png";
const VacationLogo = "/assets/backgrounds/Logo-Vacation.png";
const TurinterLogo = "/assets/backgrounds/Turinter.png";
const BannerPoints = "/assets/backgrounds/Banner-Puntos.jpg";

export default defineComponent({
  name: "forYouPointsScreen",
  components: {
    HeroImage,
    IconImage,
  },
  data() {
    return {
      bannerPoints: BannerPoints,
      benefits: [
        {
          id: 1,
          icon: "mdi-credit-card",
          description:
            "Paga los consumos que realices con tu tarjeta de crédito BSC,",
          points: "1,000 PSC(*)",
        },
        {
          id: 2,
          icon: "mdi-beach",
          description:
            "Disfruta de unas vacaciones en hoteles nacionales e internacionales,",
          points: "7,000 PSC",
        },
        {
          id: 3,
          icon: "mdi-airplane",
          description: "Compra el boleto aéreo para tus próximas vacaciones,",
          points: "12,000 PSC",
        },
        {
          id: 4,
          icon: "mdi-ferry",
          description: "Navega hacia un nuevo destino en un crucero,",
          points: "12,000 PSC",
        },
        {
          id: 5,
          icon: "mdi-car",
          description:
            "Aventúrate a nuevas experiencias alquilando vehículos nacionales e internacionales,",
          points: "7,000 PSC",
        },
        {
          id: 6,
          icon: "mdi-cart",
          description:
            "Aprovecha los beneficios de las promociones de temporada,",
          points: "7,000 PSC",
        },
        {
          id: 7,
          icon: "mdi-hiking",
          description: "Crea inolvidables recuerdos en excursiones locales,",
          points: "7,000 PSC",
        },
      ],
      agencies: [
        {
          id: 1,
          logo: VacationLogo,
          discount: "HASTA 15%",
          description: "al canjear tus PSC en Vacation Shop",
        },
        {
          id: 2,
          logo: AgencyLogo,
          discount: "10%",
          description: "al canjear tus PSC en Agencia Taveras",
        },
        {
          id: 3,
          logo: TurinterLogo,
          discount: "10%",
          description: "al canjear tus PSC en Turinter",
        },
        {
          id: 4,
          logo: GesturLogo,
          discount: "5%",
          description: "al canjear tus PSC en Gestur",
        },
      ],
    };
  },
});
</script>

<!-- HTML TEMPLATE -->
<template>
  <div>
    <!-- BANNER SECTION -->
    <v-container fluid class="points-banner pa-0">
      <v-row justify="center" no-gutters>
        <v-col cols="12" class="pa-0" style="position: relative; z-index: 0">
          <HeroImage
            src="/assets/backgrounds/Puntos-santa-cruz-banner.png"
            alt="Puntos Santa Cruz"
            :width="1920"
            :height="500"
            loading="eager"
            container-class="banner-image"
            image-class="banner-image-img"
          />
          <div class="text-overlay">
            <div class="icon-container">
              <IconImage
                src="/assets/icons/icon-card.svg"
                alt="Logo"
                :width="80"
                :height="80"
                class="icon"
              />
            </div>
            <h1 class="headline">Puntos Santa Cruz</h1>
            <p>
              Por cada <span class="bold-text">RD$100.00</span> o
              <span class="bold-text">US$3.00</span> de consumo, recibes un
              Punto que equivale a 1 peso Dominicano
            </p>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- TITLE AND DESCRIPTION SECTION -->
    <v-container fluid class="title-description-container">
      <v-row justify="center">
        <v-col cols="12" class="text-center">
          <div class="title-container">
            <h1 class="section-title">Canjea tus Puntos Santa Cruz</h1>
            <v-icon class="title-icon">mdi-cash</v-icon>
          </div>
          <p class="section-subtitle">
            Tu satisfacción es lo más importante para nosotros, por eso hemos
            creado para ti nuestro programa de recompensa Puntos Santa Cruz, a
            través del cual acumulas puntos por cada consumo que realices con
            tus <strong>Tarjetas de Crédito VISA</strong>.
          </p>
        </v-col>
      </v-row>
    </v-container>

    <!-- BENEFITS SECTION -->
    <v-container fluid class="canjea-puntos-container">
      <v-row class="d-flex flex-wrap justify-start benefits-grid">
        <v-col
          v-for="benefit in benefits"
          :key="benefit.id"
          cols="12"
          md="3"
          class="benefit-card"
        >
          <v-card class="d-flex flex-column">
            <div class="d-flex flex-column align-items-start">
              <v-icon size="40" class="mb-2">{{ benefit.icon }}</v-icon>
              <p class="benefit-description">{{ benefit.description }}</p>
            </div>
            <v-card-actions class="price-tag mt-auto">
              <span class="normal-text">desde</span>
              <span class="bold-text">{{ benefit.points }}</span>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- AGENCIES SECTION -->
    <v-container fluid class="agencies-container pa-0">
      <v-row justify="center" no-gutters>
        <v-col cols="12" class="blue-bg text-center pa-4">
          <h2 class="agencies-title">Conoce nuestras Agencias Afiliadas</h2>
        </v-col>
      </v-row>
      <v-row class="cards-agencies" justify="center" no-gutters>
        <v-col
          v-for="agency in agencies"
          :key="agency.id"
          cols="12"
          md="3"
          class="agency-card pa-2"
        >
          <v-card class="d-flex flex-column pa-0">
            <div
              class="agency-header d-flex align-items-center justify-center pa-4"
            >
              <img :src="agency.logo" alt="Agency Logo" class="agency-logo" />
            </div>
            <div
              class="agency-body d-flex flex-column justify-center align-items-center pa-4"
            >
              <div
                v-if="agency.discount.includes('HASTA')"
                class="discount-prefix"
              >
                HASTA
              </div>
              <div class="agency-discount">
                {{ agency.discount.replace("HASTA", "") }}
              </div>
              <div class="agency-description">
                <span class="bold-text">DE DESCUENTO</span> al canjear tus PSC
                en
                <span class="bold-text">{{
                  agency.description.split("en ")[1]
                }}</span>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- MORE INFO SECTION -->
    <v-container fluid class="more-info-container pa-0">
      <v-row justify="center" no-gutters>
        <v-col cols="12" class="green-bg text-center pa-4">
          <h2 class="more-info-title">¿Necesitas saber más?</h2>
        </v-col>
      </v-row>
      <v-row justify="center" no-gutters class="more-info-content">
        <!-- <v-col cols="12" md="5" class="more-info-card pa-2">
          <v-card class="d-flex flex-column pa-4">
            <div class="card-content">
              <div class="info-text">
                <h3 class="info-title">Tarifario</h3>
                <h3 class="info-subtitle">de Productos y Servicios</h3>
              </div>
              <v-btn
                href="https://stgpwebsc.blob.core.windows.net/bsc-pweb-prod/sections/66ec7e8fe59e7f6179a1120c/4522982-1726774927859.pdf?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2026-01-12T02:04:48Z&st=2025-01-31T18:04:48Z&spr=https&sig=qCkGdfW9toWR6zKeR2RbqW67PigOvBjSWcz%2BcdGgPIY%3D"
                class="pdf-button" color="primary">VER PDF</v-btn>
            </div>
          </v-card>
        </v-col> -->
        <v-col cols="12" md="5" class="more-info-card pa-2">
          <v-card class="d-flex flex-column pa-4">
            <div class="card-content">
              <div class="info-text">
                <h3 class="info-title">Términos y condiciones</h3>
                <h3 class="info-subtitle">Puntos Santa Cruz</h3>
              </div>
              <v-btn
                href="https://stgpwebsc.blob.core.windows.net/bsc-pweb-prod/sections/66ec7e8fe59e7f6179a1120c/4090352-1726774927950.pdf?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2026-01-12T02:04:48Z&st=2025-01-31T18:04:48Z&spr=https&sig=qCkGdfW9toWR6zKeR2RbqW67PigOvBjSWcz%2BcdGgPIY%3D"
                class="pdf-button"
                color="primary"
                >VER PDF</v-btn
              >
            </div>
          </v-card>
        </v-col>
        <v-col class="mt-10" cols="12">
          <div class="banner-points-wrapper">
            <HeroImage
              :src="bannerPoints"
              :alt="'Banner de puntos'"
              :width="1920"
              :height="500"
              loading="lazy"
              :container-class="'banner-points-bg'"
            />
            <!-- Elemento decorativo izquierda -->
            <div class="banner-decorative-left points-circle"></div>
            <!-- Elemento decorativo derecha inferior -->
            <div class="banner-decorative-bottom-right accessibility-icon">
              <v-icon size="40" color="white">mdi-human-handsup</v-icon>
            </div>
            <!-- Contenido del banner -->
            <div class="banner-content-wrapper">
              <v-card
                :width="$vuetify.display.mdAndDown ? '90%' : '60%'"
                class="card-points-container mx-auto pa-8"
                rounded="xl"
                color="rgba(255, 255, 255, 0.9)"
              >
                <v-card-text class="pa-6">
                  <div class="d-flex align-center mb-4">
                    <h1 class="text-primary font-weight-bold text-h4">
                      Canjea tus Puntos
                    </h1>
                    <IconImage
                      src="/assets/icons/puntos-bsc.svg"
                      alt="Puntos BSC"
                      :width="36"
                      :height="36"
                      container-class="ml-4"
                    />
                  </div>
                  <p class="text-primary text-body-2 font-weight-regular mb-6">
                    Tu satisfacción es lo más importante para nosotros
                  </p>
                  <div class="d-flex justify-start">
                    <v-btn
                      width="200"
                      height="45"
                      to="/forms/66e0a7d0915bc966f2b15dcd"
                      class="text-body-2"
                      variant="elevated"
                      rounded="xl"
                      color="primary"
                    >
                      Solicitalo Aqui
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<!-- SASS STYLES -->
<style scoped lang="scss">
/* BANNER SECTION */

// Banner de Puntos
.banner-points-wrapper {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;

  .banner-points-bg {
    width: 100%;
    height: 100%;
    
    /* stylelint-disable-next-line selector-pseudo-element-no-unknown */
    ::v-deep(.hero-image),
    /* stylelint-disable-next-line selector-pseudo-element-no-unknown */
    ::v-deep(.blur-image) {
      filter: blur(2px);
      transform: scale(1.1);
    }
  }

  .banner-decorative-left {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    pointer-events: none;

    &.points-circle {
      width: 300px;
      height: 300px;
      background-color: #4caf50;
      border-radius: 50%;
      transform: translate(-30%, -30%);
    }
  }

  .banner-decorative-bottom-right {
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 1;
    pointer-events: none;

    &.accessibility-icon {
      width: 60px;
      height: 60px;
      background-color: rgba(18, 73, 155, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .banner-content-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }

  .card-points-container {
    position: relative;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
}

// Responsive
@media (max-width: 960px) {
  .banner-points-wrapper {
    height: 400px;
  }

  .banner-decorative-left.points-circle {
    width: 200px;
    height: 200px;
  }
}

.points-banner {
  position: relative;
  padding: 0;

  .banner-image {
    width: 100%;
    height: 100%;
  }

  .banner-image-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .banner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }

  .banner-points-container {
    width: 100%;
    height: 100%;
  }

  .text-overlay {
    position: absolute;
    top: 50%;
    left: 10%;
    transform: translateY(-50%);
    color: white;
    text-align: left;
    max-width: 400px;

    @media (max-width: 768px) {
      top: 40%;
      left: 5%;
      max-width: 300px;
    }

    @media (max-width: 480px) {
      top: 50%;
      left: 2%;
      max-width: 500px;
    }
  }

  .icon-container {
    display: flex;
    justify-content: center;

    @media (max-width: 480px) {
      justify-content: flex-start;
    }
  }

  .icon {
    width: 50px;
    height: 50px;
    margin-bottom: 10px;

    @media (max-width: 480px) {
      width: 30px;
      height: 30px;
      margin-bottom: 5px;
    }
  }

  .headline {
    font-size: 2.5rem;
    font-weight: bold;
    margin: 0;

    @media (max-width: 768px) {
      font-size: 2rem;
    }

    @media (max-width: 480px) {
      font-size: 1.5rem;
    }
  }

  p {
    font-size: 1.25rem;
    margin: 10px 0 0 0;
    color: rgba(255, 255, 255, 0.7);

    @media (max-width: 768px) {
      font-size: 1rem;
    }

    @media (max-width: 480px) {
      font-size: 0.875rem;
    }
  }

  .bold-text {
    color: rgba(255, 255, 255, 1);
    font-weight: bold;
  }
}

/* TITLE AND DESCRIPTION SECTION */
.title-description-container {
  padding: 2rem 0;
  background-color: white;

  .title-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1rem;
  }

  .title-icon {
    font-size: 2rem;
    color: #4caf50;
    margin-left: 0.5rem;
  }

  .section-title {
    font-size: 2rem;
    font-weight: bold;
    color: #0056b3;
    display: inline-block;
  }

  .section-subtitle {
    font-size: 1.2rem;
    color: #555;
    margin-bottom: 2rem;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }
}

/* BENEFITS SECTION */
.canjea-puntos-container {
  padding: 2rem 0;
  background-color: #f5f5f5;

  .benefits-grid {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .benefit-card {
    flex: 0 0 23%;
    max-width: 23%;
    margin: 1%;
    box-sizing: border-box;

    @media (max-width: 768px) {
      flex: 0 0 48%;
      max-width: 48%;
    }

    @media (max-width: 480px) {
      flex: 0 0 98%;
      max-width: 98%;
    }

    .v-card {
      padding: 1rem;
      text-align: left;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: white;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      min-height: 300px;
      position: relative;
    }

    .v-icon {
      color: #4caf50;
      margin-bottom: 1rem;
    }

    .v-card-title {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding-bottom: 0;
      flex-grow: 1;
      white-space: normal;
    }

    .benefit-description {
      font-size: 1rem;
      color: #777;
      margin: 0;
    }

    .price-tag {
      background-color: #4caf50;
      color: white;
      padding: 1rem;
      text-align: center;
      border-radius: 0 0 8px 8px;
      width: 100%;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      box-sizing: border-box;

      .normal-text {
        font-size: 1rem;
        font-weight: normal;
      }

      .bold-text {
        font-size: 1.5rem;
        font-weight: bold;
      }
    }
  }
}

/* AGENCIES SECTION */
.agencies-container {
  padding: 2rem 0;
  background-color: white;

  .blue-bg {
    background-color: #0056b3;
    margin-bottom: 5%;
  }

  .agencies-title {
    font-size: 2rem;
    font-weight: bold;
    color: white;
    margin-bottom: 1rem;
  }

  .agency-card {
    padding: 0.5rem;

    .v-card {
      display: flex;
      flex-direction: column;
      text-align: center;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: white;
      padding: 0;
      height: 100%;
      width: 90%;
    }

    .agency-header {
      width: 100%;
      background-color: #0056b3;
      padding: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 8px 8px 0 0;
      height: 100px;
    }

    .agency-logo {
      width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .agency-body {
      padding: 1rem;
      width: 100%;
      height: auto;
    }

    .discount-prefix {
      font-size: 1rem;
      color: #0056b3;
      font-weight: bold;
    }

    .agency-discount {
      font-size: 4.5rem;
      font-weight: bold;
      color: #4caf50;
      margin: 0.5rem 0;
    }

    .agency-description {
      font-size: 1.2rem;
      color: #777;

      .bold-text {
        font-weight: bold;
        color: #0056b3;
      }
    }
  }

  .cards-agencies {
    width: 80%;
    margin: auto;
  }
}

/* MORE INFO SECTION */
.more-info-container {
  padding: 2rem 0;
  background-color: white;

  .green-bg {
    background-color: #4caf50;
    margin: 5%;
  }

  .more-info-title {
    font-size: 2rem;
    font-weight: bold;
    color: white;
    margin-bottom: 1rem;
  }

  .more-info-content {
    display: flex;
    justify-content: center;
  }

  .more-info-card {
    display: flex;
    justify-content: center;

    .v-card {
      display: flex;
      flex-direction: column;
      text-align: left;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #f5f7fa;
      /* Fondo gris azulado */
      padding: 1rem;
      width: 100%;
      height: 150px;
      /* Más largas */
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    .card-content {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      width: 100%;
      margin: auto;
    }

    .info-text {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .info-title {
      font-size: 1rem;
      font-weight: bold;
      color: #0056b3;
      margin: 0;
    }

    .info-subtitle {
      font-size: 1rem;
      color: #0056b3;
      margin: 0;
    }

    .pdf-button {
      font-size: 1rem;
      font-weight: bold;
      background-color: #0056b3;
      color: white;
    }

    .v-card::after {
      content: '';
      display: block;
      height: 5px;
      width: 100%;
      background-color: #0056b3;
      position: absolute;
      bottom: 0;
      left: 0;
      border-radius: 0 0 8px 8px;
    }
  }
}
</style>
