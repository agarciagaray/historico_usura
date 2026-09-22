import { BarChart3, Building2, Calendar, Moon, RotateCcw, Search, Sun, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getThemeFromStorage, setThemeToStorage, storageAvailable } from "./utils/storage";

interface TasaData {
  fechaInicial: string;
  fechaFinal: string;
  tasaAnual: string;
  tasaAnualAjustada: string;
  tasaDiaria: string;
}

interface StatsActual {
  tasaAjustada: string;
  tasaDiaria: string;
  tasaAnual: string;
  mes: string;
  año: number;
  tnm: string;
}

const BG_ORBS = [
  { left: "8%",  top: "12%", size: 320, delay: "0s",   dur: "7s"  },
  { left: "72%", top: "5%",  size: 220, delay: "1.2s", dur: "9s"  },
  { left: "55%", top: "60%", size: 280, delay: "0.6s", dur: "8s"  },
  { left: "88%", top: "75%", size: 180, delay: "2s",   dur: "10s" },
  { left: "20%", top: "78%", size: 200, delay: "1.8s", dur: "6s"  },
];

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
  delay = "0s",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent?: boolean;
  delay?: string;
}) {
  return (
    <div
      className="animate-fade-in-up flex-1 min-w-[180px] rounded-2xl border border-white/15 bg-white/8 backdrop-blur-md p-5 flex flex-col gap-3 shadow-lg hover:bg-white/12 transition-all duration-300"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/50">
          {label}
        </span>
        <span className={`p-2 rounded-xl ${accent ? "bg-primary-500/25 text-primary-300" : "bg-white/10 text-white/60"}`}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <div>
        <p className={`text-3xl font-bold tracking-tight ${accent ? "text-primary-300" : "text-white"}`}>
          {value}
        </p>
        {sub && <p className="text-xs text-white/45 mt-1 leading-snug">{sub}</p>}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded-lg shimmer" style={{ width: `${55 + i * 7}%` }} />
        </td>
      ))}
    </tr>
  );
}

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function calcularStats(lista: TasaData[]): StatsActual | null {
  if (lista.length === 0) return null;
  const ultima = lista[0];
  const tea = parseFloat(ultima.tasaAnual.replace(",", "."));
  const tasaAjustada = ultima.tasaAnualAjustada.replace(",", ".");
  const tnm = ((Math.pow(1 + tea / 100, 1 / 12) - 1) * 100).toFixed(4);
  const now = new Date();
  return {
    tasaAjustada,
    tasaDiaria: ultima.tasaDiaria,
    tasaAnual: ultima.tasaAnual,
    tnm,
    mes: MESES[now.getMonth()],
    año: now.getFullYear(),
  };
}

function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      const stored = getThemeFromStorage();
      if (stored) return stored;
      return "dark";
    } catch {
      return "dark";
    }
  });

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      if (next === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      if (storageAvailable()) setThemeToStorage(next);
    } catch {
      // noop
    }
  };

  const [datos, setDatos] = useState<TasaData[]>([]);
  const [datosFiltrados, setDatosFiltrados] = useState<TasaData[]>([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [statsActual, setStatsActual] = useState<StatsActual | null>(null);

  useEffect(() => {
    cargarDatos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    setError("");
    try {
      const idSheets = "1Yn4cslq3YvOTV_GjJfDVTA5u0OO-7lJYLM2bGacrucM";
      const apiKey = "AIzaSyC3WUX9yr1ym-VsGH1c7Clx1LrNRC2vSm4";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${idSheets}/values/A2:E1000?key=${apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const valores: string[][] = data.values || [];

      if (valores.length === 0) {
        throw new Error("No se encontraron datos en la hoja de cálculo");
      }

      const datosFormateados: TasaData[] = valores.map((fila) => ({
        fechaInicial: fila[0] || "",
        fechaFinal: fila[1] || "",
        tasaAnual: fila[2] || "",
        tasaAnualAjustada: fila[3] || "",
        tasaDiaria: fila[4] || "",
      }));

      datosFormateados.sort((a, b) => {
        const fa = new Date(a.fechaInicial.split("/").reverse().join("-"));
        const fb = new Date(b.fechaInicial.split("/").reverse().join("-"));
        return fb.getTime() - fa.getTime();
      });

      setDatos(datosFormateados);
      setDatosFiltrados(datosFormateados);
      setStatsActual(calcularStats(datosFormateados));
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError(err instanceof Error ? err.message : "Error desconocido al cargar los datos");

      const datosEjemplo: TasaData[] = [
        { fechaInicial: "01/06/2025", fechaFinal: "30/06/2025", tasaAnual: "25.9700", tasaAnualAjustada: "23.9700", tasaDiaria: "0.0657" },
        { fechaInicial: "01/05/2025", fechaFinal: "31/05/2025", tasaAnual: "25.6200", tasaAnualAjustada: "23.6200", tasaDiaria: "0.0647" },
        { fechaInicial: "01/04/2025", fechaFinal: "30/04/2025", tasaAnual: "24.9200", tasaAnualAjustada: "22.9200", tasaDiaria: "0.0628" },
      ];

      setDatos(datosEjemplo);
      setDatosFiltrados(datosEjemplo);
      setStatsActual(calcularStats(datosEjemplo));
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    if (!fechaDesde && !fechaHasta) {
      setDatosFiltrados([...datos]);
      return;
    }
    const filtrados = datos.filter((item) => {
      const fi = new Date(item.fechaInicial.split("/").reverse().join("-"));
      const ff = new Date(item.fechaFinal.split("/").reverse().join("-"));
      let ok = true;
      if (fechaDesde) ok = ok && (fi >= new Date(fechaDesde) || ff >= new Date(fechaDesde));
      if (fechaHasta) ok = ok && fi <= new Date(fechaHasta);
      return ok;
    });
    setDatosFiltrados(filtrados);
  };

  const limpiarFiltros = () => {
    setFechaDesde("");
    setFechaHasta("");
    setDatosFiltrados([...datos]);
  };

  const hayFiltros = fechaDesde !== "" || fechaHasta !== "";

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden">

      {/* Decorative background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {BG_ORBS.map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 blur-3xl animate-pulse bg-primary-500"
            style={{
              left: orb.left,
              top: orb.top,
              width: orb.size,
              height: orb.size,
              animationDelay: orb.delay,
              animationDuration: orb.dur,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/60 via-transparent to-primary-800/40" />
      </div>

      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-primary-900/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary-500/20 border border-primary-400/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-300" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-white leading-tight truncate">
                Tasa de Usura Colombia
              </h1>
              <p className="text-[10px] text-primary-400 font-medium leading-tight hidden sm:block">
                Histórico certificado por la Superfinanciera
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {error && (
              <span className="hidden md:flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Datos de ejemplo
              </span>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/8 hover:bg-white/14 border border-white/10 hover:border-white/20 text-white/80 hover:text-white transition-all duration-200 text-xs font-medium"
            >
              {theme === "dark"
                ? <Sun className="w-4 h-4 text-amber-300" />
                : <Moon className="w-4 h-4 text-indigo-300" />}
              <span className="hidden sm:inline">
                {theme === "dark" ? "Claro" : "Oscuro"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="pt-16 pb-16">

        {/* Hero / Stats */}
        <section className="border-b border-white/8 bg-white/3 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

            {statsActual && !cargando && (
              <div className="animate-slide-down inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-primary-500/15 border border-primary-400/25 text-primary-300 text-xs font-semibold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                {statsActual.mes} {statsActual.año} — Vigente
              </div>
            )}

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Tasas de Interés de Referencia
            </h2>
            <p className="text-sm text-white/50 mb-7">
              Indicadores del período actual según certificación oficial
            </p>

            <div className="flex flex-wrap gap-4">
              {cargando ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="flex-1 min-w-[180px] rounded-2xl border border-white/10 bg-white/5 p-5 h-28 shimmer" />
                ))
              ) : statsActual ? (
                <>
                  <StatCard label="Tasa Efectiva Anual"   value={`${statsActual.tasaAnual}%`}    sub="TEA — Tasa máxima permitida"     icon={TrendingUp} delay="0s"    />
                  <StatCard label="Tasa Nominal Mensual"  value={`${statsActual.tnm}%`}           sub="TNM equivalente"                 icon={BarChart3}  delay="0.08s" />
                  <StatCard label="Tasa Ajustada Anual"   value={`${statsActual.tasaAjustada}%`}  sub="Usura efectiva ajustada"         icon={TrendingUp} accent delay="0.16s" />
                  <StatCard label="Tasa Diaria"           value={`${statsActual.tasaDiaria}%`}    sub="Interés diario de referencia"    icon={Calendar}   delay="0.24s" />
                </>
              ) : null}
            </div>
          </div>
        </section>

        {/* Filters + Table */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* Filter bar */}
          <div className="animate-fade-in mb-6 rounded-2xl border border-white/12 bg-white/6 backdrop-blur-md p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
              Filtrar por rango de fechas
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-end">

              <div className="flex-1 min-w-0">
                <label htmlFor="fecha-desde" className="block text-xs font-medium text-white/70 mb-1.5">
                  Desde
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
                  <input
                    id="fecha-desde"
                    type="date"
                    title="Fecha desde"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/6 border border-white/15 hover:border-white/25 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-400/60 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <label htmlFor="fecha-hasta" className="block text-xs font-medium text-white/70 mb-1.5">
                  Hasta
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
                  <input
                    id="fecha-hasta"
                    type="date"
                    title="Fecha hasta"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/6 border border-white/15 hover:border-white/25 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-400/60 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={aplicarFiltros}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-400 active:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/25 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 focus:ring-offset-transparent"
                >
                  <Search className="w-3.5 h-3.5" />
                  Buscar
                </button>
                {hayFiltros && (
                  <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/8 hover:bg-white/14 border border-white/12 hover:border-white/20 text-white/70 hover:text-white text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Limpiar</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results meta */}
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-xs text-white/40">
              {!cargando && (
                <>
                  <span className="font-semibold text-white/70">{datosFiltrados.length}</span>
                  {" "}período{datosFiltrados.length !== 1 ? "s" : ""} encontrado{datosFiltrados.length !== 1 ? "s" : ""}
                  {hayFiltros && <span className="ml-1 text-primary-400">· filtro activo</span>}
                </>
              )}
            </p>
            {error && (
              <p className="text-xs text-amber-400/80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
                Mostrando datos de ejemplo
              </p>
            )}
          </div>

          {/* Table */}
          <div className="animate-fade-in rounded-2xl border border-white/12 bg-white/5 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/30">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/12 bg-white/8">
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Período inicial</th>
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Período final</th>
                    <th className="px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-white/50">TEA (%)</th>
                    <th className="px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-primary-400/80">TNM (%)</th>
                    <th className="px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-primary-400/80">Ajustada (%)</th>
                    <th className="px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-white/50">Diaria (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
                  ) : datosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3 text-white/30">
                          <Search className="w-8 h-8" />
                          <p className="text-sm font-medium">Sin resultados para el rango seleccionado</p>
                          <button
                            type="button"
                            onClick={limpiarFiltros}
                            className="text-xs text-primary-400 hover:text-primary-300 underline underline-offset-2 transition-colors"
                          >
                            Limpiar filtros
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    datosFiltrados.map((item, index) => {
                      const tea = parseFloat(item.tasaAnual.replace(",", "."));
                      const tnm = ((Math.pow(1 + tea / 100, 1 / 12) - 1) * 100).toFixed(5);
                      const isFirst = index === 0;
                      return (
                        <tr
                          key={index}
                          className={`border-b border-white/6 last:border-0 transition-colors duration-150 ${
                            isFirst
                              ? "bg-primary-500/8 hover:bg-primary-500/14"
                              : index % 2 === 0
                                ? "hover:bg-white/5"
                                : "bg-white/3 hover:bg-white/7"
                          }`}
                        >
                          <td className="px-4 py-3 font-mono text-xs text-white/80 whitespace-nowrap">
                            {isFirst && (
                              <span className="mr-2 inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded bg-primary-500/25 text-primary-300 border border-primary-400/20">
                                Vigente
                              </span>
                            )}
                            {item.fechaInicial}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-white/80 whitespace-nowrap">
                            {item.fechaFinal}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-white/90 tabular-nums">
                            {item.tasaAnual}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-block px-2 py-0.5 rounded-lg bg-primary-500/15 text-primary-300 font-bold tabular-nums text-xs">
                              {tnm}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-block px-2 py-0.5 rounded-lg bg-primary-500/15 text-primary-300 font-bold tabular-nums text-xs">
                              {item.tasaAnualAjustada}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-white/60 tabular-nums text-xs">
                            {item.tasaDiaria}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 px-1">
            {[
              { color: "bg-white/50",    label: "TEA — Tasa Efectiva Anual"    },
              { color: "bg-primary-400", label: "TNM — Tasa Nominal Mensual"   },
              { color: "bg-primary-300", label: "Ajustada — Usura certificada" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${item.color} opacity-80`} />
                <span className="text-[11px] text-white/35">{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/8 bg-primary-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-500/20 border border-primary-400/20 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-primary-400" />
            </div>
            <span className="text-xs text-white/40">
              Desarrollado por{" "}
              <span className="text-white/70 font-semibold">Alejandro García Garay</span>
            </span>
          </div>
          <p className="text-[11px] text-white/25 text-center sm:text-right">
            Fuente: Superintendencia Financiera de Colombia · Datos históricos certificados
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
