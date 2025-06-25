# 📈 Tasa de Usura Colombia

Aplicación web para consultar el histórico de la **Tasa de Usura en Colombia**, con filtros por fecha y visualización clara de tasas efectivas, ajustadas y nominales mensuales.  
Desarrollado con React + Tailwind CSS y consumo de datos desde Google Sheets.

---

## 🚀 Características principales

- Consulta del histórico de tasas de usura en Colombia.
- Filtros por rango de fechas.
- Cálculo automático de la **Tasa Nominal Mensual (TNM)** a partir de la Tasa Efectiva Anual (TEA).
- Interfaz moderna, responsiva y amigable.
- Encabezado de tabla fijo y legible.
- Consumo de datos en tiempo real desde Google Sheets.
- Opción para limpiar filtros y mostrar todo el histórico.

---

## 🛠️ Instalación y ejecución

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/historico_usura_react.git
cd historico_usura_react
```

### 2. Instala las dependencias

```bash
npm install
```
o si usas yarn:
```bash
yarn install
```

### 3. Configura las variables de entorno

Crea un archivo `.env` en la raíz del proyecto y agrega tus credenciales de Google Sheets:

```env
VITE_APP_SHEETS_ID=tu_id_de_hoja
VITE_APP_GOOGLE_API_KEY=tu_api_key
```

> **Nota:**  
> - El ID de la hoja de cálculo lo encuentras en la URL de tu Google Sheets.  
> - La API Key la generas en [Google Cloud Console](https://console.cloud.google.com/), habilitando la API de Google Sheets.

### 4. Ejecuta la aplicación en modo desarrollo

```bash
npm run dev
```
o
```bash
yarn dev
```

Abre tu navegador en [http://localhost:5173](http://localhost:5173) para ver la aplicación.

---

## 📊 Ejemplo de uso

- Selecciona un rango de fechas para filtrar el histórico.
- Haz clic en **Filtrar** para ver los resultados.
- Usa **Limpiar filtro** para mostrar todo el histórico nuevamente.

---

## 📝 Créditos

Desarrollado por **Alejandro García Garay**  
Inspirado en la necesidad de transparencia y acceso fácil a la información financiera en Colombia.

---

## 🛡️ Licencia

Este proyecto está bajo la licencia MIT.  
Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

¡Contribuciones y sugerencias son bienvenidas!