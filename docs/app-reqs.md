# Requisitos del Proyecto: Gym Tracker App

En la siguiente lista se recogen los requisitos de la aplicación, priorizando el flujo principal ("Core") de Live Workout.

## 1. CORE: Live Workout (Entrenamiento en Vivo)

Este es el flujo principal de la aplicación.

### 1.1. Interfaz de Ejecución
Durante la sesión, la pantalla del ejercicio debe mostrar:
* **Estado Descanso:** Cronómetro corriendo (lista de sets semi-completa).
* **Botones Principales:**
    * **"He completado mi set":** Para registrar el set actual.
    * **"Saltar":** Para saltar el ejercicio actual y pasar inmediatamente al siguiente (si existe).
* **Cronómetro:** Cuenta atrás del descanso. Al llegar a 0, suena una alarma indicando el inicio del ejercicio.
* **Silenciar Alarma:** Switch on/off para el sonido del cronómetro.
* **Edición "En caliente":** Botón para editar Sets, Descanso, Peso, Reps del ejercicio actual si lo pautado no es realista.

### 1.2. Lógica de "Saltar"
* Al pulsar "Saltar", el sistema omite los sets restantes del ejercicio actual.
* Navega inmediatamente al primer set del **siguiente ejercicio** en el plan.
* Si no hay más ejercicios, lleva al Resumen del Entrenamiento.

### 1.3. Completar Set (Modal)
Al pulsar "He completado mi set":
* Se abre un **Modal** superpuesto.
* **Input:** El usuario introduce el número de repeticiones realizadas.
* **Acciones:**
    * **"Cancelar":** Cierra el modal y vuelve a la pantalla del ejercicio sin guardar cambios.
    * **"Okay":** Guarda las repeticiones, marca el set como completado y avanza al siguiente set (o finaliza el ejercicio).

### 1.4. Lógica de Progresión (Progressive Overload)
Esta lógica se ejecuta automáticamente **solo al finalizar el último set** de un ejercicio:
* **Rango Superior (e.g., >11 reps):** Si las repeticiones realizadas superan el rango superior, el sistema **aumentará el peso** automáticamente para la próxima sesión.
* **Rango Inferior (e.g., <4 reps):** Si las repeticiones son inferiores al rango menor, el sistema **disminuirá el peso** para la próxima sesión.
* **Rango Medio:** Si las repeticiones están dentro del rango, el peso se mantiene igual.

### 1.5. Resumen del Entrenamiento
Cuando se completan todos los ejercicios (o se saltan):
* Se muestra una pantalla de **Resumen**.
* **Contenido:**
    * Lista de ejercicios realizados.
    * Repeticiones totales o por set.
    * **Ajustes de Peso:** Indicación visual de si el peso ha subido o bajado para la próxima sesión según la lógica de progresión.

---

## 2. Otros Requisitos (Gestión y Configuración)

### 2.1. Gestión de Ejercicios
* **Crear Ejercicios:** Seleccionar de BD o crear manualmente (Nombre, Variante, Descripción, Foto).
* **Añadir a Programas:** Desde ficha de ejercicio o desde vista de programa.
* **Listado Global:** Ver, editar y eliminar ejercicios de la base de datos.

### 2.2. Gestión de Programas y Rutinas
* **Programas Customizados:** Definir estructura (e.g., Split PPL).
* **Gestión de Días:** Añadir/Editar/Eliminar días (e.g., Día A: Pierna).
* **Programación:** Semanal (L-D) o Periódica (Rotativa).
* **Gestión de Ejercicios en Días:** Añadir/Editar/Eliminar ejercicios en un día específico.

### 2.3. Contexto y Recordatorios (Dashboard)
* **Pantalla Inicio:**
    * Último día completado.
    * Día actual (con botón "Comenzar sesión").
    * Siguiente día planificado.
* **Detalle Día Actual:** Listado de ejercicios que tocan hoy.

### 2.4. Progreso y Configuración Inicial
* **Progreso por Ejercicio:** Ver objetivo actual (peso, reps, tiempo).
* **Punto de Inicio:** Configurar sets, descanso, peso/reps iniciales.
* **Historial:** Gráfica o listado de progreso.

### 2.5. Planificación Futura y Notas
* **Modificar Próxima Sesión:** Indicar cambios manuales para la próxima vez.
* **Notas:** CRUD de notas textuales por ejercicio.

### 2.6. Requisitos No Funcionales y Datos
* **Almacenamiento:** CSV maestro de sets completados (Bandaid).
* **Internacionalización:** Soporte multi-idioma.
* **Persistencia:** Local first.

---
## 3. Changelog & Estado del Proyecto

### ✅ Implementado (v0.1 - Core Live Workout)
*   **Contexto de Entrenamiento (LiveWorkoutContext):**
    *   Gestión de estado de sesión (ejercicios, sets, descanso).
    *   Datos mockeados para pruebas inmediatas.
*   **Pantalla de Ejecución Activa (ActiveExerciseScreen):**
    *   Diseño fiel al wireframe y sistema de diseño (Dark Mode, Tailwind).
    *   Lista de sets con estados visuales (activo, completado, pendiente).
    *   **Cronómetro de Descanso:** Integrado en la interfaz (no popup), siempre visible.
    *   **Botón "Saltar":** Funcional, avanza al siguiente ejercicio.
    *   **Botón "Completar Set":** Abre el modal de confirmación.
*   **Modal de Completar Set:**
    *   Input para repeticiones reales.
    *   Lógica de guardado y avance.
*   **Lógica de Progresión (Progressive Overload):**
    *   Cálculo automático de ajuste de peso (+2.5kg / -5kg) al finalizar el último set.
*   **Pantalla de Resumen (WorkoutSummaryScreen):**
    *   Listado de ejercicios completados.
    *   Visualización de "Badges" con los ajustes de peso recomendados para la próxima sesión.

### 🚧 Pendiente / Próximos Pasos
1.  **Integración con Base de Datos Real:**
    *   Reemplazar datos mockeados en `LiveWorkoutContext` con consultas a SQLite (`drizzle`).
    *   Guardar historial de sesiones y actualizaciones de peso en DB.
2.  **Funcionalidad de Edición "En Caliente":**
    *   Implementar la pantalla/modal para editar peso/reps del ejercicio actual (actualmente es un `alert`).
3.  **Sonido de Alarma:**
    *   Implementar sonido real al finalizar el cronómetro (actualmente es un `console.log`).
4.  **Gestión de Rutinas (Sección 2.2):**
    *   Crear pantallas para definir programas y asignar ejercicios a días.
5.  **Dashboard (Sección 2.3):**
    *   Implementar pantalla de inicio con resumen de progreso y acceso rápido.
