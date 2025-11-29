Version vieja, no se usa.

Quiero crear una aplicacion de ayuda para el gimnasio. La idea basica es la siguiente:

# Requisitos funcionales

En la siguiente lista se recogen los requisitos de la aplicación, así como ejemplos de su funcionamiento.

## 1.1. Quiero poder crear los ejercicios que hago, en cualquier momento.

Idealmente podría seleccionar un ejercicio de una base de datos de ejercicios previa, para ahorrar tiempo, en su defecto, poder crear el ejercicio.

Flujo 1: Seleccione de entre una lista, con un buscador, e.g.: "fondos en paralela", y se añade a mis ejercicios.
Flujo 2: Si el ejercicio no existe, es necesario crearlo. Los campos serían "nombre", "descripcion", "foto". Donde descripcion y foto sería opcional.

## 1.2. Quiero poder añadir los ejercicio a cualquier programa que tenga.

Flujo 1: Dados los conjuntos de ejercicos que "tengo", añadirlo a un programa desde el ejercicio.
Flujo 2: Dado un programa, añadirle un ejercicio que "tengo" o cualquier otro desde la base de datos (equivalnete al flujo 2 del requisito 1.1, es decir, se añade al programa y además a los ejercicios que tengo)

## 2. Quiero poder establecer un programa customizado.

El usuario indica cuantas variaciones de día tiene, y con qué frecuencia se dan, es decir, para un usuario que tenga un split PPL, indicaría: 
	
	"""
	- Dia A: Push: press de banca, flexiones, fondos, triceps con mancuerna.
	- Dia B: Pull: dominadas, extension de dorsal, biceps, lumbar.
	- Dia C: Leg: squats, tibiales, nordicas.
	"""
	
Seguidamente el sistema pregunta la programación temporal, para la que hay que admitir cualquier posibilidad, por ejemplo:

	- Programacion semanal: donde cada dia (A, B, C, etc) se asigna a un día de la semana.
	- Programacion periodica customizada: donde cada día se asigna en un periodo repetible de días arbitrario, e.g.: repetir la siguiente secuencia de días: "Dia 1: A, Dia 2: B, Día 3: Rest, Dia 4: C, Dia 5: D", esta secuencia se repetiria cada `n` días (tan larga como sea la lista), independientemente del dia de la semana o mes.
	
Hay que establecer los días de descanso, especialmente en la programacion periodica.

## 3. Quiero tener un recordatorio de qué día me toca hoy, asumiendo una programación previa.

e.g.: "Ultimo día fue \"A: Pecho\", hoy te toca día \"B: Pierna\""

### 3.1. Quiero tener un listado de los ejercicios que me tocan hoy.

e.g.: "hoy te tocan los ejercicios: press de banca, dumbell flights, isquios y squats"

## 4.1. Quiero tener un listado de qué progreso tengo en cada ejercicio.

El sistema de debe almacenar y presentar el progreso para cada ejercicio seleccionado, ya sean peso, repeticiones o tiempo. e.g.: "para press de banca, te toca hacer 12 repeticiones de 60kg"

## 4.2. Quiero poder establecer un punto de inicio para cada ejercicio.

Para cualquier ejercicio, si no tiene datos previos, debo de establecer un punto de incio, donde debo de indicar:
	- numero de sets
	- si es de peso:
		- numero de repeticiones
		- peso (si se mide en peso, como cualquier ejercicio de mancuerna o gym)
	- si es de tiempo:
		- tiempo (si se mide en tiempo, para ejericicios isometricos)

## 4.3. Quiero poder ver mi progeso historico en los ejercicios.

Un listado o grafica muestra el progeso hasta la fecha, filtrado de forma tipica (all, 1y, 6m, 1w, 1d, custom, etc)

## 5.1. Quiero poder modificar el progreso de un ejercicio para el dia siguiente

Para cada ejercicio poder añadir/modifcar el progreso para la siguiente vez que se haga. Es decir, si hoy he hecho quiero poder indicar al sistema que suba el progreso (ya sea tiempo, sets, peso, repeticione, etc) para el dia siguiente. e.g.:

	- Flujo 1: Hoy he hecho "press de banca: 12 repeticiones de 60kg", indico al sistema que incremente el peso a 65kg.
	- Flujo 2: Hoy he hecho "press de banca: 12 repeticiones de 60kg", indico al sistema que lo mantenga igual para el día siguiente.
	- Flujo 3: Hoy he hecho "press de banca: 12 repeticiones de 60kg", indico al sistema que incremente las repeticiones a 15.
	
## 5.2. Quiero poder dejar una nota para el dia siguiente en un ejercicio

Para un ejericicio quiero poder dejar una nota para el dia siguiente. Tambien debo de poder eliminar la nota que he dejado de un dia anterior. Se debe de poder modifcar las notas, idealmente habria un listado de notas, si hay mas de una:

e.g.: para press de banca, existen las notas: "N1: Focus en explosividad", "N2: Hacer concentrico a una velocidad razonable", poder efecutar operaciones CRUD sobre las notas.
	
## 6. Quiero poder trackear a tiempo real cada sesion de ejercicio

### 6.1. Para cada set de cada ejercicio, mostrar qué hacer:

e.g. Flujo de un ejercicio:

"press de banca: hacer 12 repeticiones de 60kg. Te quedan 4 sets." 

Cuando acabo un set, se lo indico al sistema "Completado un set"

- Se comienza la cuenta atras del descanso
- Me pregunta cuántas repeticiones he hecho (para poder trackear si el peso llega bien)
- Al acabar el tiempo de descanso (e.g.: 3 minutos) suena una alarma y se imprime nuevamente

"press de banca: hacer 12 repeticiones de 60kg. Te quedan 3 sets."

Cuando se acaban los sets, se pasa al siguiente ejercicio, cuando se acaban los ejercicios se completa la sesion de entrenamiento.

### 6.2. Quiero poder saltar al siguiente ejercicio desde cualquier ejercicio actual

Si estoy en la pantalla de un ejericicio, quiero poder saltar al siguiente ejercicio, se guardaría la información parcial/vacia del ejercicio actual en el historico.

### 6.3. Quiero poder silenciar la alarma del cronometro de antemano

En la pantalla del ejercicio debera existir un switch de sonido on a off, para mutear el sonido de la alarma del cronometro.

### 7. Quiero poder actualizar el ejercicio cuando acabe todos sus sets

Cuando complete todos los sets (o salte al siguiente ejercicio) debe aparecer una pantalla de edicion del ejercicio para el siguiente día, pudiendo mantener todo igual o incrementando alguno de sus parametros.

### 8. Quiero poder inputear cuantas repeticiones he hecho para cada set

Cuando seleccione completar un set, el sistema deberia de pedir cuantas repeticiones he hecho.

### 9. Quiero poder guardar mis datos historicos de ejercicios (bandaid por ahora)

Cada completcion de un set se guarda como una linea añadida a un csv maestro, que recoje los parametros del ejercicio, los datos actuales y los que estoy completando. Despues se generara un reporte desglosado con la info del mismo.

# Requsitos no funcionales

## 1. La app debe de tener un sistema de i18n robusto para una cantidad arbitraria de idiomas

# Notas de desarrollo e investigacion

- Investigar posibles bases de datos de ejercicios con fotos e información relevante ya expuesta en internet, tiene que ser gratis.

- Investigar posible conexion usando google drive para almacenar en la nube, independientemente, todo se tiene que guardar localmente.