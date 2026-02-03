import type { UserInterface } from "~/interfaces/user.interface";

export default defineNuxtRouteMiddleware((to) => {
  // GET USER STATE & TOKEN COOKIE
  const userCookie = useCookie("authUser");
  const token = useCookie("access_token");

  // console.log("Middleware Dashboard - userCookie:", userCookie.value);
  // console.log("Middleware Dashboard - token:", token.value);

  // PARSE USER COOKIE SAFELY
  let user: UserInterface | null =
    userCookie.value && typeof userCookie.value === "object"
      ? (userCookie.value as UserInterface)
      : null;

  // IS AUTHENTICATED
  const isAuthenticated = !!user && !!token.value;

  // IS ADMIN
  const isAdmin =
    user && Array.isArray(user.roles) && user.roles.includes("admin");

  // ADMIN ROUTES
  const adminRoutes = [
    "/dashboard",
    "/admin",
    "/settings",
    "/adjudicated",
    "/business",
    "/channels",
    "/enterprise",
    "/financially",
    "/forms",
    "/insurance",
    "/podcast",
    "/previews",
    "/products",
    "/profits",
    "/promotions",
    "/prouser",
    "/regulatory",
    "/sliders",
    "/targets",
  ];

  // 🔒 IF NOT AUTHENTICATED
  if (!isAuthenticated && to.path !== "/") {
    // console.log("Redirigiendo a / porque no está autenticado");
    return navigateTo("/");
  }

  // 🔒 ID ROL IS NOT ADMIN
  if (adminRoutes.includes(to.path) && !isAdmin) {
    // console.log("Redirigiendo a / porque no es admin");
    return navigateTo("/");
  }
});
