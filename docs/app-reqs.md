# Requisitos del Proyecto: Gym Tracker App

En la siguiente lista se recogen los requisitos de la aplicación, así como ejemplos de su funcionamiento, integrando la lógica de negocio y el diseño de interfaz propuesto.

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

### 2.2. Quiero gestionar los ejercicios dentro de un día específico. **(Nuevo)**
Al entrar en el detalle de un día (e.g., "Día A"), quiero ver la lista de ejercicios asignados y tener opciones para:
* **Añadir ejercicio** (desde la base de datos).
* **Ver/Editar/Eliminar** un ejercicio específico de ese día.

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
* **Estado Descanso:** Cronómetro corriendo (lista de sets semi-completa).
* **Botones Principales:**
    * **"He completado mi set":** Para registrar el set actual.
    * **"Saltar":** Para saltar el ejercicio actual y pasar inmediatamente al siguiente (si existe).
* **Cronómetro:** Cuenta atrás del descanso. Al llegar a 0, suena una alarma indicando el inicio del ejercicio.

### 6.2. Lógica de "Saltar"
* Al pulsar "Saltar", el sistema omite los sets restantes del ejercicio actual.
* Navega inmediatamente al primer set del **siguiente ejercicio** en el plan.
* Si no hay más ejercicios, lleva al Resumen del Entrenamiento.

### 6.3. Quiero poder silenciar la alarma.
Switch on/off para el sonido del cronómetro.

### 6.4. Quiero poder editar el ejercicio durante la sesión actual ("En caliente"). **(Nuevo)**
Si el peso o repeticiones pautados no son realistas para el día de hoy, quiero tener un botón de edición (icono lápiz/configuración) en la pantalla de ejecución.
* Esto me lleva a una pantalla de edición donde puedo cambiar Sets, Descanso, Peso, Reps, etc.
* Los cambios se aplican al ejercicio actual (sets restantes) y se guardan para el futuro.

### 6.5. Completar Set (Modal)
Al pulsar "He completado mi set":
* Se abre un **Modal** superpuesto.
* **Input:** El usuario introduce el número de repeticiones realizadas.
* **Acciones:**
    * **"Cancelar":** Cierra el modal y vuelve a la pantalla del ejercicio sin guardar cambios (por si fue error).
    * **"Okay":** Guarda las repeticiones, marca el set como completado y avanza al siguiente set (o finaliza el ejercicio).

## 7. Lógica de Progresión (Progressive Overload)
Esta lógica se ejecuta automáticamente **solo al finalizar el último set** de un ejercicio:

* **Rango Superior (e.g., >11 reps):** Si las repeticiones realizadas superan el rango superior, el sistema **aumentará el peso** automáticamente para la próxima sesión.
* **Rango Inferior (e.g., <4 reps):** Si las repeticiones son inferiores al rango menor, el sistema **disminuirá el peso 5kg** para la próxima sesión.
* **Rango Medio:** Si las repeticiones están dentro del rango, el peso se mantiene igual.

## 8. Resumen del Entrenamiento
Cuando se completan todos los ejercicios (o se saltan):
* Se muestra una pantalla de **Resumen**.
* **Contenido:**
    * Lista de ejercicios realizados.
    * Repeticiones totales o por set.
    * **Ajustes de Peso:** Indicación visual de si el peso ha subido o bajado para la próxima sesión según la lógica de progresión.

---

# Requisitos No Funcionales

1.  **Internacionalización (i18n):** Sistema robusto para múltiples idiomas.
2.  **Persistencia:** Guardado local prioridad, sincronización en nube opcional (Google Drive).