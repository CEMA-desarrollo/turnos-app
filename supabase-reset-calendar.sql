-- Eliminar los turnos desde hoy en adelante para limpiar pruebas y desplazamientos sucios
DELETE FROM turnos_sabado WHERE fecha >= CURRENT_DATE;

-- (Luego de correr esto, ve a la app Panel Admin -> Planificación y toca "Regenerar")
