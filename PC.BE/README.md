<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

---
---
Configurar conexion DB
src/common/constants/index.ts
---
---

# 📦 Proceso de Pase a Producción

## 1. Subir el archivo por FTP

- **Ruta destino:** `/home/zcdcambios/Pase/`  
- **Nota:** Crear una carpeta con la **fecha del pase**. El archivo debe ser **copiado**, no movido.

---

## 2. Conectarse por SSH como Super User en CyberARK

---

## 3. Cambiar los permisos del archivo

El archivo estará inicialmente como propietario `zcdcambios`, debe cambiar a:  
**Usuario:** `usrpropwb`  
**Grupo:** `usrdevpwb`

```bash
chown usrpropwb:usrdevpwb /home/zcdcambios/Pase/(FolderFechaActual)/(ArchivoDelPase)

ls -lrt /home/zcdcambios/Pase/(FolderFechaActual)/(ArchivoDelPase)

```

## 4. hacer un backup de la carpeta de donde sera hara el pase comando
```bash
mkdir -p /home/zcdcambios/backup/(FolderFechaActual)
cp -rf /opt/pweb_backend/ /home/zcdcambios/backup/(FolderFechaActual)
```

## 5. movemos el archivo zip a la ruta esto
```bash
mv /home/zcdcambios/Pase/(FolderFechaActual)/(Archivo del pase) /opt/pweb_backend/
```
## 6.  Cambiamos el usuario del portal
```bash
Cmd: su - usrpropwb
```
## 7.  Ahora nos movemos al ruta de portal 
```bash
cmd: cd /opt/pweb_backend/
```
## 8.  ver ID y estado del servicio  
```bash
pm2 status
```
## 9.  Detener servicio de Backend por ID (ID 0)
```bash
pm2 stop 0
```
## 11. descomprimir entregable 
```bash
unzip /opt/pweb_backend/(archivo del pase)
```
## 12. renombrar la carpeta origen
```bash
mv .dist dist_bk_(fecha_actual)
```
## 12. renombrar carpeta del pase a nombre de produccion
```bash
mv dist .dist
```
## 13. subir servicio PM2
```bash
pm2 flush
pm2 start 0
pm2 log 0
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
