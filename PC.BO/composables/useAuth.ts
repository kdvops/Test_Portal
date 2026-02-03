export const useAuth = () => {
  const userCookie = useCookie("authUser");

  const user = computed(() => {
    try {
      return userCookie.value ? userCookie.value : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = computed(() => !!user.value);

  const onAuth = async (token: string) => {
    const { onLogin } = useApollo();
    await onLogin(token);
  };

  const onSession = async (userData: any) => {
    // Verifica que userData es un objeto antes de guardar
    if (typeof userData === "object" && userData !== null) {
      userCookie.value = JSON.stringify(userData);
    } else {
      console.warn("userData no es un objeto válido:", userData);
      userCookie.value = null;
    }
  };

  const logout = async () => {
    const { onLogout } = useApollo();
    await onLogout();
    userCookie.value = null;
  };

  const restoreSession = () => {
    // Ya se hidrata desde la cookie
    return;
  };

  return { user, isAuthenticated, onAuth, logout, onSession, restoreSession };
};
