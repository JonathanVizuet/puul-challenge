Feature: Gestión de Usuarios
  Como administrador del sistema
  Quiero gestionar los usuarios del equipo
  Para controlar el acceso y la asignación de tareas

  Scenario: Crear un usuario exitosamente
    Given que tengo datos válidos de nombre, email y rol
    When envío una solicitud POST /users con esos datos
    Then el sistema debe retornar el usuario creado con status 201
    And el usuario debe quedar almacenado en la base de datos

  Scenario: Intentar crear un usuario con email duplicado
    Given que ya existe un usuario registrado con email "jvizuetr@gmail.com"
    When intento crear otro usuario con el mismo email
    Then el sistema debe retornar un error 409 Conflict
    And el mensaje debe indicar que el email ya está registrado

  Scenario: Listar usuarios filtrando por rol
    Given que existen usuarios con roles "admin" y "member" en el sistema
    When solicito la lista de usuarios filtrando por rol "admin"
    Then el sistema debe retornar únicamente los usuarios con rol "admin"

  Scenario: Listar usuarios incluye métricas de tareas completadas
    Given que un usuario tiene tareas completadas asignadas
    When solicito la lista de usuarios
    Then cada usuario debe incluir "completed_tasks_count"
    And cada usuario debe incluir "completed_tasks_total_cost"

  Scenario: Obtener el detalle de un usuario existente
    Given que existe un usuario con un id conocido
    When solicito GET /users/:id con ese id
    Then el sistema debe retornar el detalle completo del usuario
    And debe incluir su lista de tareas asignadas

  Scenario: Buscar un usuario que no existe
    Given que no existe ningún usuario con el id proporcionado
    When solicito GET /users/:id
    Then el sistema debe retornar un error 404 Not Found

  Scenario: Actualizar los datos de un usuario
    Given que existe un usuario en el sistema
    When envío nuevos datos mediante PATCH /users/:id
    Then el sistema debe retornar el usuario con los datos actualizados

  Scenario: Eliminar un usuario existente
    Given que existe un usuario en el sistema
    When solicito DELETE /users/:id
    Then el sistema debe confirmar la eliminación exitosa
    And el usuario no debe existir en consultas posteriores