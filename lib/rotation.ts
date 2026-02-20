import { eachWeekOfInterval, nextSaturday, isSaturday, addDays, startOfDay } from 'date-fns'

export interface Fisio {
    id: string
    nombre: string
    iniciales: string
    color: string
}

export interface TurnoSabado {
    fecha: string // ISO date string
    fisio1_id: string
    fisio2_id: string
}

// Las 4 fisioterapeutas con sus colores
export const FISIOS: Fisio[] = [
    { id: 'blanca', nombre: 'Blanca Antonelli', iniciales: 'BA', color: '#6366f1' },
    { id: 'samantha', nombre: 'Samantha Pineda', iniciales: 'SP', color: '#ec4899' },
    { id: 'mariana', nombre: 'Mariana Bravo', iniciales: 'MB', color: '#14b8a6' },
    { id: 'betania', nombre: 'Betania Garcia', iniciales: 'BG', color: '#f59e0b' },
]

// 6 combinaciones únicas de parejas de 4 fisios
export const PAREJAS: [string, string][] = [
    // ── Fijas (coordinadas manualmente) ──────────────
    ['mariana', 'betania'],   // 1: 21 Feb
    ['blanca', 'samantha'],  // 2: 28 Feb
    ['blanca', 'betania'],   // 3:  7 Mar
    // ── Autogeneradas (ciclo equitativo) ─────────────
    ['samantha', 'mariana'],   // 4: 14 Mar  ← iguala a todos en 2
    ['samantha', 'betania'],   // 5: 21 Mar
    ['blanca', 'mariana'],   // 6: 28 Mar  → ciclo completo, todos con 3
]

/**
 * Obtiene todos los sábados desde hoy hasta el 31 de diciembre de 2026
 */
export function getSabadosRestantes(): Date[] {
    const hoy = startOfDay(new Date())
    const fin = new Date(2026, 11, 31) // 31 dic 2026

    const sabados: Date[] = []
    let current = hoy

    // Si hoy es sábado, incluirlo, sino ir al próximo
    if (!isSaturday(current)) {
        current = nextSaturday(current)
    }

    while (current <= fin) {
        sabados.push(new Date(current))
        current = addDays(current, 7)
    }

    return sabados
}

/**
 * Genera la planificación completa rotando las 6 parejas cíclicamente
 * garantizando máxima equidad y rotación de parejas
 */
export function generarPlanificacion(sabados: Date[]): TurnoSabado[] {
    return sabados.map((fecha, index) => {
        const pareja = PAREJAS[index % PAREJAS.length]
        return {
            fecha: fecha.toISOString().split('T')[0],
            fisio1_id: pareja[0],
            fisio2_id: pareja[1],
        }
    })
}

/**
 * Cuenta los sábados trabajados por cada fisio
 */
export function contarTurnosPorFisio(turnos: TurnoSabado[]): Record<string, number> {
    const conteo: Record<string, number> = {}
    FISIOS.forEach(f => { conteo[f.id] = 0 })
    turnos.forEach(t => {
        conteo[t.fisio1_id] = (conteo[t.fisio1_id] || 0) + 1
        conteo[t.fisio2_id] = (conteo[t.fisio2_id] || 0) + 1
    })
    return conteo
}

export function getFisioById(id: string): Fisio | undefined {
    return FISIOS.find(f => f.id === id)
}
