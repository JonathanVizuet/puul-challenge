Feature: Gestión de Tareas
  Como miembro del equipo
  Quiero gestionar las tareas del proyecto
  Para dar seguimiento al trabajo y productividad del equipo

  Scenario: Crear una tarea y asignarla a usuarios existentes
    Given que existen usuarios válidos en el sistema
    When creo una tarea con título, estimación de horas y usuarios asignados
    Then la tarea debe crearse con status 201
    And la respuesta debe incluir los usuarios asignados a la tarea

  Scenario: Intentar crear una tarea con usuarios inexistentes
    Given que proporciono IDs de usuarios que no existen en el sistema
    When intento crear la tarea con esos IDs
    Then el sistema debe retornar un error 400 Bad Request
    And el mensaje debe indicar que uno o más usuarios no fueron encontrados

  Scenario: Listar tareas con múltiples filtros simultáneos
    Given que existen múltiples tareas en el sistema
    When solicito la lista de tareas filtrando por título y fecha de vencimiento
    Then el sistema debe retornar solo las tareas que coincidan con ambos filtros
    And las tareas deben estar ordenadas de más reciente a menos reciente

  Scenario: Filtrar tareas por nombre o correo del usuario asignado
    Given que existen tareas asignadas al usuario "John" con email "john@puul.com"
    When filtro las tareas por user_name "John"
    Then solo deben aparecer las tareas asignadas a ese usuario

  Scenario: Actualizar una tarea y reasignar usuarios
    Given que existe una tarea asignada al usuario "Ana"
    When actualizo la tarea cambiando el usuario asignado a "John"
    Then los usuarios anteriores deben ser removidos de la tarea
    And los nuevos usuarios deben quedar correctamente asignados

  Scenario: Completar una tarea cambiando su estado
    Given que existe una tarea en estado "active"
    When actualizo su estado a "completed"
    Then la tarea debe reflejarse con status "completed" en el sistema

  Scenario: Eliminar una tarea existente
    Given que existe una tarea en el sistema
    When solicito eliminar esa tarea por su id
    Then el sistema debe confirmar la eliminación exitosa

  Scenario: Buscar una tarea que no existe
    Given que no existe ninguna tarea con el id proporcionado
    When solicito el detalle de esa tarea
    Then el sistema debe retornar un error 404 Not Found