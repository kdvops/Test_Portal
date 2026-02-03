export const useInactivity = () => {
  const { logout } = useAuth();
  
  // 15 minutos en milisegundos
  const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
  
  let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  
  // Eventos que indican actividad del usuario
  const activityEvents = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'keydown'
  ];

  // Función para manejar el deslogueo automático
  const handleAutoLogout = async () => {
    try {
      console.log('🔒 Deslogueo automático por inactividad');
      await logout();
      await navigateTo('/');
    } catch (error) {
      console.error('Error durante el deslogueo automático:', error);
    }
  };

  // Función para resetear el timer de inactividad
  const resetInactivityTimer = () => {
    // Limpiar timer existente
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    
    // Crear nuevo timer
    inactivityTimer = setTimeout(() => {
      handleAutoLogout();
    }, INACTIVITY_TIMEOUT);
  };

  // Función para manejar eventos de actividad
  const handleActivity = () => {
    resetInactivityTimer();
  };

  // Función para iniciar el monitoreo de inactividad
  const startInactivityMonitoring = () => {
    if (import.meta.client) {
      // Agregar listeners para eventos de actividad
      activityEvents.forEach(event => {
        document.addEventListener(event, handleActivity, true);
      });
      
      // Iniciar el timer
      resetInactivityTimer();
      console.log('✅ Monitoreo de inactividad iniciado (15 minutos)');
    }
  };

  // Función para detener el monitoreo de inactividad
  const stopInactivityMonitoring = () => {
    if (import.meta.client) {
      // Remover listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      // Limpiar timer
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
      }
      console.log('🛑 Monitoreo de inactividad detenido');
    }
  };

  // Limpiar recursos al desmontar
  onBeforeUnmount(() => {
    stopInactivityMonitoring();
  });

  return {
    startInactivityMonitoring,
    stopInactivityMonitoring,
    resetInactivityTimer
  };
};
