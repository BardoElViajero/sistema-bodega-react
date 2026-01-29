# Sistema de Gestión de Inventario WMS (Telco & ISP) 📡

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Aplicación Web Progresiva (PWA) desarrollada para la gestión logística integral de una empresa proveedora de internet (ISP). El sistema soluciona la pérdida de trazabilidad en materiales de ferretería y activos fijos críticos.

## 🚀 Funcionalidades Clave

### 🛠️ Módulo de Ferretería (Consumibles)
- **Sistema de "Carrito de Compras":** Permite a los bodegueros seleccionar múltiples ítems (cables, conectores) y procesar un retiro masivo asignado a un técnico.
- **Ingreso Inteligente:** Detección automática de stock existente para sumar cantidades o crear nuevos ítems en tiempo real.
- **Control de Origen:** Registro obligatorio de facturas o proveedores en los ingresos.

### 📡 Módulo de Antenas (Activos Fijos)
- **Trazabilidad Unitaria:** Seguimiento individual por **Número de Serie** y **Dirección MAC**.
- **Ciclo de Vida de Activos:** 1. *Ingreso a Bodega*
  2. *Asignación a Técnico* (Salida)
  3. *Recuperación/Reingreso* (Retorno de material de clientes).
- **Estado en Tiempo Real:** Visualización inmediata de qué técnico tiene qué equipo específico.

### 📊 Dashboard y Bitácora
- **Alertas de Stock Crítico:** Semáforos visuales para reabastecimiento.
- **Reportes Diarios:** Vista tipo calendario para auditar movimientos por día, agrupados por técnico responsable.
- **Buscador Global:** Filtrado instantáneo de todo el inventario.

### 📱 Tecnología y UX
- **Escáner Integrado:** Uso de la cámara del dispositivo móvil para leer códigos de barras/QR (Librería `html5-qrcode`).
- **PWA Ready:** Diseño *Mobile-First* optimizado para uso en terreno y tablets.
- **Serverless:** Backend gestionado totalmente en Firebase (Firestore + Auth).

## 🔧 Instalación y Despliegue Local

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/TU_USUARIO/TU_REPOSITORIO.git](https://github.com/TU_USUARIO/TU_REPOSITORIO.git)
    cd TU_REPOSITORIO
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto con tus credenciales de Firebase:
    ```env
    REACT_APP_FIREBASE_API_KEY=tu_api_key
    REACT_APP_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
    # ... resto de credenciales
    ```

4.  **Ejecutar:**
    ```bash
    npm start
    ```

## 📄 Licencia
Proyecto desarrollado para portafolio profesional y gestión privada de inventario.
