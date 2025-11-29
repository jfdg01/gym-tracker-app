# Requisitos del Proyecto: Gym Tracker App

En la siguiente lista se recogen los requisitos de la aplicación, así como ejemplos de su funcionamiento, integrando la lógica de negocio y el diseño de interfaz propuesto.

> [!NOTE]
> **Arquitectura de Datos:** El sistema distingue explícitamente entre "Planificado" (Target) y "Realizado" (Performed). Esto permite mantener un historial fiel de lo que realmente ocurrió, independientemente de cómo cambie el plan futuro.

## 1. Gestión de Ejercicios

### 1.1. Quiero poder crear los ejercicios que hago, en cualquier momento. **(Actualizado)**
Idealmente podría seleccionar un ejercicio de una base de datos de ejercicios previa para ahorrar tiempo; en su defecto, poder crear el ejercicio manualmente.

* **Flujo 1:** Seleccionar de entre una lista con un buscador (e.g.: "fondos en paralela") y añadirlo a mis ejercicios.
* **Flujo 2:** Si el ejercicio no existe, crearlo. Los campos obligatorios y opcionales serán:
    * Nombre (e.g., Press de Banca)
    * **Variante** (e.g., Inclinado, Agarre estrecho)
    * Descripción (opcional)
    * Foto (opcional)

### 1.2. Quiero poder añadir los ejercicios a cualquier programa que tenga.
* **Flujo 1:** Desde la ficha de un ejercicio, añadirlo a un programa existente.
* **Flujo 2:** Desde la vista de un programa, añadir un ejercicio existente o crear uno nuevo.

### 1.3. Quiero poder gestionar mi listado global de ejercicios. **(Nuevo)**
Quiero tener un acceso directo desde la pantalla principal a un listado maestro de todos mis ejercicios.
* Debe permitir **Ver**, **Editar** los detalles (nombre, variante, foto) y **Eliminar** ejercicios de la base de datos.

## 2. Gestión de Programas y Rutinas

### 2.1. Quiero poder establecer y modificar un programa customizado. **(Actualizado)**
El usuario define la estructura de su rutina (e.g., Split PPL). Desde la pantalla principal se puede acceder a "Modificar programa".
* **Gestión de Días:** Dentro del programa, quiero poder **Añadir**, **Editar** (cambiar nombre) o **Eliminar** días completos (e.g., Día A: Pierna, Día B: Brazos).
* **Programación temporal:**
    * *Semanal:* Asignar días (A, B, C) a días de la semana (Lunes, Martes...).
    * *Periódica/Rotativa:* Secuencia repetible (e.g., A, B, Rest, C, D) que se repite cada `n` días.
    * **Implementación:** La secuencia se define mediante una estructura JSON flexible para permitir patrones complejos sin cambios en el esquema.

### 2.2. Quiero gestionar los ejercicios dentro de un día específico. **(Nuevo)**
Al entrar en el detalle de un día (e.g., "Día A"), quiero ver la lista de ejercicios asignados y tener opciones para:
* **Añadir ejercicio** (desde la base de datos).
* **Ver/Editar/Eliminar** un ejercicio específico de ese día.
* **Superseries:** Capacidad de agrupar ejercicios en superseries.

## 3. Contexto y Recordatorios (Dashboard)

### 3.1. Quiero tener contexto de mi programación en la pantalla de inicio. **(Actualizado)**
La pantalla principal debe mostrar claramente:
* **El último día completado:** (e.g.: "El último día te tocó: Día D: Extra").
* **El día actual:** (e.g.: "Hoy te toca día A: Pierna") con un botón de acción rápida para "Comenzar sesión".
* **El siguiente día planificado:** (e.g.: "El siguiente día te toca: Día B: Brazos").

### 3.2. Quiero tener un listado de los ejercicios que me tocan hoy.
Al ver el detalle del día actual, se listan los ejercicios (e.g.: "press de banca, isquios, squats").

## 4. Progreso y Configuración Inicial

### 4.1. Quiero tener un listado de qué progreso tengo en cada ejercicio.
El sistema debe almacenar y presentar el objetivo para la sesión actual (peso, reps, tiempo).

### 4.2. Quiero poder establecer un punto de inicio para cada ejercicio. **(Actualizado)**
Para cualquier ejercicio sin datos previos, debo indicar:
* Número de sets.
* **Tiempo de descanso objetivo** (entre sets).
* Variables de esfuerzo:
    * Si es por peso: Peso (kg/lbs) y Repeticiones.
    * Si es por tiempo: Tiempo (segundos/minutos).

### 4.3. Quiero poder ver mi progreso histórico.
Gráfica o listado filtrable (1y, 6m, 1w, etc.) del progreso.

## 5. Planificación Futura y Notas

### 5.1. Quiero poder modificar el progreso para el día siguiente.
Al finalizar un ejercicio, indicar si para la próxima vez se debe:
* Mantener todo igual.
* Incrementar peso, reps o sets.

### 5.2. Quiero poder dejar una nota para el día siguiente.
Capacidad CRUD sobre notas textuales para un ejercicio (e.g., "Focus en explosividad").

## 6. Tracking de Sesión en Tiempo Real

### 6.1. Interfaz de ejecución de ejercicio. **(Actualizado)**
Durante la sesión, la pantalla del ejercicio debe mostrar:
* **Objetivo:** "Hacer 12 reps de 60kg".
* **Estado:** "He completado un set".
* **Cronómetro:** Al completar un set, inicia cuenta atrás del descanso definido. Al finalizar, suena alarma.
* **Historial de la sesión actual:** Un listado visual que se va rellenando conforme completo sets (e.g., "Set 1: 12 reps, 60kg, RPE 8", "Set 2: 11 reps, 60kg, RPE 9").

### 6.2. Quiero poder saltar al siguiente ejercicio.
Botón "Saltar" para pasar al siguiente ejercicio sin completar los sets restantes, guardando lo realizado hasta el momento.

### 6.3. Quiero poder silenciar la alarma.
Switch on/off para el sonido del cronómetro.

### 6.4. Quiero poder editar el ejercicio durante la sesión actual ("En caliente"). **(Nuevo)**
Si el peso o repeticiones pautados no son realistas para el día de hoy, quiero tener un botón de edición (icono lápiz/configuración) en la pantalla de ejecución.
* Esto me lleva a una pantalla de edición donde puedo cambiar Sets, Descanso, Peso, Reps, etc.
* Los cambios se aplican al ejercicio actual (sets restantes) y se guardan para el futuro.

### 6.5. Quiero registrar las repeticiones reales.
Al marcar un set como "completado", el sistema debe confirmar o pedir el número de repeticiones realizadas (por si fallé antes de llegar al objetivo).

## 7. Actualización Post-Ejercicio
Al acabar todos los sets de un ejercicio (o saltarlo), aparece la pantalla de edición para preparar la siguiente sesión (mantener o progresar).

## 8. Almacenamiento de Datos (Bandaid)
Guardado en **JSON local** para simplificar la arquitectura y facilitar la exportación.

---

# Requisitos No Funcionales

1.  **Internacionalización (i18n):** Sistema robusto para múltiples idiomas.
2.  **Persistencia:** Guardado local prioridad, sincronización en nube opcional (Google Drive).