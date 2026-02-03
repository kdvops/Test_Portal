import type { Route } from './route.interface'

export interface DrawerOptions {
  show: boolean;
  rail: boolean;
  absolute: boolean;
  right: boolean;
  app: boolean;
  expandOnHover: boolean;
  routes: Array<Route>;
  routesUserConfig: Array<Route>;
}
