import { nextSaturday, isSaturday, addDays, startOfDay } from 'date-fns'

export interface Fisio {
    id: string
    nombre: string
    iniciales: string
    color: string
    activa: boolean
}

export interface TurnoSabado {
    id?: string
    fecha: string // ISO date string
    fisio1_id: string
    fisio2_id: string
    estado?: string
    nota?: string
}

/**
 * Obtiene todos los sábados del año 2026 (ancla fija)
 * Esto garantiza que el índice de parejas no se desplace dependiendo del día en que se genere.
 */
export function getAllSabados(): Date[] {
    const inicio = new Date(2026, 0, 1) // 1 de Enero 2026
    const fin = new Date(2026, 11, 31) // 31 dic 2026

    const sabados: Date[] = []
    let current = inicio

    // Si el inicio no es sábado, ir al próximo
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
 * Filtra los sábados desde hoy en adelante (útil para la UI, no para la generación indexada)
 */
export function getSabadosRestantes(): Date[] {
    const hoy = startOfDay(new Date())
    return getAllSabados().filter(d => d >= hoy)
}

/**
 * Genera combinaciones de parejas según las fisios activas
 */
export function generarParejas(fisios: Fisio[]): [string, string][] {
    const activas = fisios.filter(f => f.activa);

    // Si hay exactamente 4 activas, mantenemos la lógica específica de equidad preaprobada
    if (activas.length === 4) {
        return [
            [activas[2].id, activas[3].id],
            [activas[0].id, activas[1].id],
            [activas[0].id, activas[3].id],
            [activas[1].id, activas[2].id],
            [activas[1].id, activas[3].id],
            [activas[0].id, activas[2].id],
        ];
    }

    // Si no son 4, generamos todas las combinaciones posibles
    const pairs: [string, string][] = [];
    for (let i = 0; i < activas.length; i++) {
        for (let j = i + 1; j < activas.length; j++) {
            pairs.push([activas[i].id, activas[j].id]);
        }
    }
    return pairs;
}

/**
 * Genera la planificación completa rotando cíclicamente las parejas.
 * Utiliza el ancla de todo el año para mantener la paridad matemática intacta,
 * de forma que el sábado X siempre reciba a la pareja Y sin importar qué día se ejecute.
 */
export function generarPlanificacion(sabadosAsignar: Date[], fisios: Fisio[]): TurnoSabado[] {
    const parejas = generarParejas(fisios);
    if (parejas.length === 0) return [];

    const anclaAnual = getAllSabados();

    return sabadosAsignar.map(fecha => {
        // Encontramos qué número de sábado del año es
        const absoluteIndex = anclaAnual.findIndex(d => d.getTime() === fecha.getTime());
        const safeIndex = absoluteIndex >= 0 ? absoluteIndex : 0;

        // Fase de ajuste (+5) para que el ciclo concuerde con la inercia manual que llevaban en la clínica
        // El 21 de Feb (índice absoluto 7) al sumarle 5 se vuelve 12, que módulo 6 es 0 (Pareja 1)
        const pareja = parejas[(safeIndex + 5) % parejas.length]

        return {
            fecha: fecha.toISOString().split('T')[0],
            fisio1_id: pareja[0],
            fisio2_id: pareja[1],
            estado: 'planificado'
        }
    })
}

/**
 * Cuenta los sábados trabajados por cada fisio para la gráfica de equidad.
 */
export function contarTurnosPorFisio(turnos: TurnoSabado[], fisios: Fisio[]): Record<string, number> {
    const conteo: Record<string, number> = {}
    fisios.forEach(f => { conteo[f.id] = 0 })
    turnos.forEach(t => {
        if (t.fisio1_id && t.fisio1_id !== 'vacio' && t.estado !== 'cancelado') conteo[t.fisio1_id] = (conteo[t.fisio1_id] || 0) + 1
        if (t.fisio2_id && t.fisio2_id !== 'vacio' && t.estado !== 'cancelado') conteo[t.fisio2_id] = (conteo[t.fisio2_id] || 0) + 1
    })
    return conteo
}

export function getFisioById(fisios: Fisio[], id: string): Fisio | undefined {
    return fisios.find(f => f.id === id)
}
