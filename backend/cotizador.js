// cotizador.js
const SERVICIOS = {
  AVALUO: "Avaluo",
  ESTIMACION_VALOR: "EstimacionValor",
  INSPECCION: "Inspeccion",
};
const IVA = 0.16; // SIEMPRE 16%

function formatoNumeroPesos(n) {
  return new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(Math.round(n));
}
function normalizaM2(valor) {
  const n = Number(String(valor ?? "").replace(/[^\d.]/g, ""));
  if (!isFinite(n) || n < 0) throw new Error("Los m² deben ser un número >= 0.");
  return Math.max(Math.ceil(n), 1);
}
function calculaCargoBase(resultado_fxs) {
  if (resultado_fxs <= 1_000_000) return 2500;
  return Math.floor(resultado_fxs / 1_000_000) * 1000;
}
function recargoPorServicio(servicio) {
  switch (servicio) {
    case SERVICIOS.AVALUO: return 0;
    case SERVICIOS.ESTIMACION_VALOR: return 2500;
    case SERVICIOS.INSPECCION: return 3500;
    default: return 0;
  }
}
function calculaPlanos({ incluir_planos, tipo_propiedad, m2_construccion }) {
  if (!incluir_planos) return 0;
  if (String(tipo_propiedad).toLowerCase() === "terreno") return 0;
  const m2 = normalizaM2(m2_construccion);
  const base = 3500;
  const excedente = Math.max(m2 - 150, 0);
  const bloques = Math.ceil(excedente / 100);
  return base + bloques * 1000;
}
function acentuarServicio(servicio) {
  let s = (servicio || "").toLowerCase();
  s = s.replace(/estimacion/g, "estimación");
  s = s.replace(/avaluo/g, "avalúo");
  s = s.replace(/inspeccion/g, "inspección");
  if (servicio && servicio[0] === servicio[0].toUpperCase()) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
  }
  return s;
}

function cotizar({
  servicio,
  tipo_propiedad,
  m2_construccion = 0,
  m2_terreno = 0,
  factor_servicio = 15000,
  incluir_planos = false
}) {
  if (!servicio) throw new Error("Falta seleccionar el servicio.");
  if (!tipo_propiedad) throw new Error("Falta seleccionar el tipo de propiedad.");

  const usarTerreno = String(tipo_propiedad).toLowerCase() === "terreno";
  const m2_calculo = usarTerreno ? normalizaM2(m2_terreno) : normalizaM2(m2_construccion);
  const fx = Number(factor_servicio);
  if (!isFinite(fx) || fx <= 0) throw new Error("factor_servicio debe ser un número > 0.");

  const resultado_fxs = fx * m2_calculo;
  const cargo_base = calculaCargoBase(resultado_fxs);
  const recargo = recargoPorServicio(servicio);
  const monto_servicio = cargo_base + recargo;

  const cargo_planos = calculaPlanos({ incluir_planos, tipo_propiedad, m2_construccion });

  const lineas = [{ concepto: servicio, importe: monto_servicio }];
  if (cargo_planos > 0) lineas.push({ concepto: "Planos Arquitectónicos", importe: cargo_planos });

  const subtotal = lineas.reduce((acc, l) => acc + l.importe, 0);
  const montoIVA = Math.round(subtotal * IVA);
  const total = subtotal + montoIVA;

  const lineas_texto = lineas.map(l => `${acentuarServicio(l.concepto)}  ${formatoNumeroPesos(l.importe)} pesos`);

  return {
    salida: {
      lineas: lineas_texto,
      subtotal: `${formatoNumeroPesos(subtotal)} `,
      iva: `${formatoNumeroPesos(montoIVA)} `,
      total: `${formatoNumeroPesos(total)} `
    },
    totales_numericos: { subtotal, iva: montoIVA, total },
    calculo: {
      m2_calculo,
      resultado_fxs,
      cargo_base,
      recargo_servicio: recargo,
      cargo_planos,
      iva_porcentaje: IVA
    }
  };
}

module.exports = { cotizar, SERVICIOS };
