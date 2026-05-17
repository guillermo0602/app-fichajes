import { PunchModel } from './punch.model';
import { PunchType } from './punch.model';

interface ResumenDia {
    fecha: string;
    entradas: Date[];
    salidas: Date[];
    horasTrabajadas: number;
    fichajeIncompleto: boolean;
}

interface InformeEmpleado {
    empleadoId: string;
    fechaInicio: string;
    fechaFin: string;
    totalHorasTrabajadas: number;
    totalDiasTrabajados: number;
    diasConFichajeIncompleto: number;
    desglosePorDia: ResumenDia[];
}

// Calcula la diferencia en horas entre dos fechas
function calcularHoras(inicio: Date, fin: Date): number {
  return (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
}

export async function generarInformeEmpleado(
    empleadoId: string,
    fechaInicio: Date,
    fechaFin: Date
    ): Promise<InformeEmpleado> {

    // Obtener todos los fichajes del empleado en el rango de fechas
    const fichajes = await PunchModel.find({
        employeeId: empleadoId,
        timestamp: {
            $gte: fechaInicio,
            $lte: fechaFin,
        },
    }).sort({ timestamp: 1 });

    // Agrupar por día
    const grupos: { [fecha: string]: { entradas: Date[]; salidas: Date[] } } = {};

    fichajes.forEach((fichaje) => {
        const fecha = fichaje.timestamp.toISOString().split('T')[0];
        if (!grupos[fecha]) {
            grupos[fecha] = { entradas: [], salidas: [] };
        }

        if (fichaje.type === PunchType.CLOCK_IN) {
            grupos[fecha].entradas.push(fichaje.timestamp);
        } else {
            grupos[fecha].salidas.push(fichaje.timestamp);
        }
    });

    // Calcular horas por día
    const desglosePorDia: ResumenDia[] = [];
    let totalHoras = 0;
    let diasConFichajeIncompleto = 0;

    Object.entries(grupos).forEach(([fecha, { entradas, salidas }]) => {
        let horasDia = 0;
        const fichajeIncompleto = entradas.length !== salidas.length;

        if (fichajeIncompleto) diasConFichajeIncompleto++;

        // Calcular horas por cada par entrada/salida
        const pares = Math.min(entradas.length, salidas.length);
        for (let i = 0; i < pares; i++) {
            horasDia += calcularHoras(entradas[i], salidas[i]);
        }

        totalHoras += horasDia;

        desglosePorDia.push({
            fecha,
            entradas,
            salidas,
            horasTrabajadas: Math.round(horasDia * 100) / 100,
            fichajeIncompleto,
        });
    });

    return {
        empleadoId,
        fechaInicio: fechaInicio.toISOString().split('T')[0],
        fechaFin: fechaFin.toISOString().split('T')[0],
        totalHorasTrabajadas: Math.round(totalHoras * 100) / 100,
        totalDiasTrabajados: desglosePorDia.length,
        diasConFichajeIncompleto,
        desglosePorDia,
    };
}