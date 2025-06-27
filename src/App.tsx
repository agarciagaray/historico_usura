import { Building2, Calendar, Filter, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface TasaData {
  fechaInicial: string;
  fechaFinal: string;
  tasaAnual: string;
  tasaAnualAjustada: string;
  tasaDiaria: string;
}

function App() {
  const [datos, setDatos] = useState<TasaData[]>([]);
  const [datosFiltrados, setDatosFiltrados] = useState<TasaData[]>([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [textoActual, setTextoActual] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    setError("");
    try {
      // filepath: c:\Temp\historico_usura_react\src\App.tsx
      // const idSheets = import.meta.env.APP_SHEETS_ID || "";
      // const apiKey = import.meta.env.APP_GOOGLE_API_KEY || "";
      const idSheets = "1Yn4cslq3YvOTV_GjJfDVTA5u0OO-7lJYLM2bGacrucM"; // Reemplaza con tu ID de Google Sheets
      const apiKey = "AIzaSyC3WUX9yr1ym-VsGH1c7Clx1LrNRC2vSm4"; // Reemplaza con tu API Key de Google

      // URL corregida para la API de Google Sheets
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${idSheets}/values/A2:E1000?key=${apiKey}`;

      console.log("Cargando datos desde:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Error HTTP: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Datos recibidos:", data);

      const valores = data.values || [];

      if (valores.length === 0) {
        throw new Error("No se encontraron datos en la hoja de cálculo");
      }

      const datosFormateados: TasaData[] = valores.map((fila: string[]) => ({
        fechaInicial: fila[0] || "",
        fechaFinal: fila[1] || "",
        tasaAnual: fila[2] || "",
        tasaAnualAjustada: fila[3] || "",
        tasaDiaria: fila[4] || "",
      }));

      // Ordenar por fecha descendente
      datosFormateados.sort((a, b) => {
        const fechaA = new Date(a.fechaInicial.split("/").reverse().join("-"));
        const fechaB = new Date(b.fechaInicial.split("/").reverse().join("-"));
        return fechaB.getTime() - fechaA.getTime();
      });

      setDatos(datosFormateados);
      setDatosFiltrados(datosFormateados);
      generarTextoActual(datosFormateados);

      console.log(
        "Datos procesados correctamente:",
        datosFormateados.length,
        "registros"
      );
    } catch (error) {
      console.error("Error cargando datos:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error desconocido al cargar los datos"
      );

      // Datos de ejemplo para mostrar la interfaz
      const datosEjemplo: TasaData[] = [
        {
          fechaInicial: "01/06/2025",
          fechaFinal: "30/06/2025",
          tasaAnual: "25.9700",
          tasaAnualAjustada: "23.9700",
          tasaDiaria: "0.0657",
        },
        {
          fechaInicial: "01/05/2025",
          fechaFinal: "31/05/2025",
          tasaAnual: "25.6200",
          tasaAnualAjustada: "23.6200",
          tasaDiaria: "0.0647",
        },
        {
          fechaInicial: "01/04/2025",
          fechaFinal: "30/04/2025",
          tasaAnual: "24.9200",
          tasaAnualAjustada: "22.9200",
          tasaDiaria: "0.0628",
        },
      ];

      setDatos(datosEjemplo);
      setDatosFiltrados(datosEjemplo);
      generarTextoActual(datosEjemplo);
    } finally {
      setCargando(false);
    }
  };

  const generarTextoActual = (datos: TasaData[]) => {
    if (datos.length > 0) {
      const ultimaFila = datos[0];
      const valorTasaAjustada = ultimaFila.tasaAnualAjustada.replace(",", ".");
      const valorTasaDiaria = (parseFloat(valorTasaAjustada) / 365).toFixed(14);

      const fechaActual = new Date();
      const meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      const mes = meses[fechaActual.getMonth()];
      const año = fechaActual.getFullYear();

      setTextoActual(
        `En ${mes} ${año}, la tasa de Usura ajustada es ${valorTasaAjustada}% (diaria: ${valorTasaDiaria}%)`
      );
    }
  };

  const aplicarFiltros = () => {
    if (!fechaDesde && !fechaHasta) {
      setDatosFiltrados([...datos]);
      return;
    }

    const filtrados = datos.filter((item) => {
      const fechaInicialItem = new Date(
        item.fechaInicial.split("/").reverse().join("-")
      );
      const fechaFinalItem = new Date(
        item.fechaFinal.split("/").reverse().join("-")
      );

      let cumpleFiltro = true;

      if (fechaDesde) {
        const fechaDesdeObj = new Date(fechaDesde);
        cumpleFiltro =
          cumpleFiltro &&
          (fechaInicialItem >= fechaDesdeObj ||
            fechaFinalItem >= fechaDesdeObj);
      }

      if (fechaHasta) {
        const fechaHastaObj = new Date(fechaHasta);
        cumpleFiltro = cumpleFiltro && fechaInicialItem <= fechaHastaObj;
      }

      return cumpleFiltro;
    });

    setDatosFiltrados(filtrados);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-800 text-white relative overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${10 + i * 12}%`,
              top: `${Math.random() * 100}%`,
              width: `${12 + Math.random() * 16}px`,
              height: `${12 + Math.random() * 16}px`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Fixed Header - Más compacto */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-2">
          {/* Title Section - Más compacto */}
          <div className="text-center mb-2">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-orange-400" />
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Tasa de Usura Colombia
              </h1>
            </div>
            <p className="text-xs text-orange-400 font-medium">
              Desarrollado por Alejandro García Garay
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-2 mb-2 border border-red-400/30">
              <p className="text-xs text-red-200 text-center">⚠️ {error}</p>
              <p className="text-xs text-red-300 text-center mt-1">
                Mostrando datos de ejemplo
              </p>
            </div>
          )}

          {/* Current Rate Info - Más compacto */}
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2 mb-2 border border-white/20">
            <div className="flex items-center justify-center gap-2 text-xs md:text-sm">
              <TrendingUp className="w-3 h-3 text-orange-400 flex-shrink-0" />
              <p className="text-center leading-tight">
                {textoActual && (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: textoActual.replace(
                        /(\d+\.?\d*%)/g,
                        '<span class="text-orange-400 font-semibold">$1</span>'
                      ),
                    }}
                  />
                )}
              </p>
            </div>
          </div>

          {/* Filters - Layout horizontal más compacto */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20">
            <div className="flex flex-col md:flex-row gap-2 items-end">
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium mb-1 text-white/90">
                  Fecha Desde
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/60" />
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="w-full pl-6 pr-2 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium mb-1 text-white/90">
                  Fecha Hasta
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/60" />
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="w-full pl-6 pr-2 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                onClick={aplicarFiltros}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-semibold rounded-lg transition-all transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-transparent"
              >
                <Filter className="w-3 h-3" />
                Filtrar
              </button>
              <button
                onClick={() => {
                  setFechaDesde("");
                  setFechaHasta("");
                  setDatosFiltrados([...datos]);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white text-xs font-semibold rounded-lg transition-all transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-transparent"
                type="button"
              >
                Limpiar filtro
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Margin top reducido significativamente */}
      <div className="pt-60 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Table Container */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            {cargando ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-3 border-white/30 border-t-orange-400 rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-medium">
                  Cargando datos de tasa de usura...
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[calc(100vh-160px)]">
                <table className="w-full">
                  <thead className="bg-white/20 backdrop-blur-sm sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/20">
                        Fecha Inicial
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-white/20">
                        Fecha Final
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider border-b border-white/20">
                        Tasa Efectiva Anual (%)
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-semibold text-blue-500 uppercase tracking-wider border-b border-white/20">
                        Tasa Nominal Mensual (%)
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-semibold text-orange-400 uppercase tracking-wider border-b border-white/20">
                        Tasa Ajustada (%)
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider border-b border-white/20">
                        Tasa Diaria (%)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {datosFiltrados.map((item, index) => {
                      // Calcular TNM
                      const tea = parseFloat(item.tasaAnual.replace(",", "."));
                      const tnm = (
                        (Math.pow(1 + tea / 100, 1 / 12) - 1) *
                        100
                      ).toFixed(5);

                      return (
                        <tr
                          key={index}
                          className="hover:bg-white/5 transition-colors duration-200"
                          style={{
                            animation: `fadeInUp 0.6s ease-out ${
                              index * 0.05
                            }s both`,
                          }}
                        >
                          <td className="px-3 py-2.5 text-sm text-white">
                            {item.fechaInicial}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-white">
                            {item.fechaFinal}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-white text-right font-medium">
                            {item.tasaAnual}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-blue-400 text-right font-bold">
                            {tnm}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-orange-400 text-right font-bold">
                            {item.tasaAnualAjustada}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-white text-right">
                            {item.tasaDiaria}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default App;
