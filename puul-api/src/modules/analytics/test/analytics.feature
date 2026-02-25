Feature: Analítica del sistema
  Como administrador del equipo
  Quiero consultar estadísticas del sistema
  Para tomar decisiones basadas en datos reales

  Scenario: Obtener resumen general de tareas
    Given que existen tareas activas y completadas en el sistema
    When solicito el endpoint GET /analytics/stats
    Then la respuesta debe incluir el total de tareas
    And debe incluir el conteo agrupado por estado
    And debe incluir el costo total y horas estimadas por estado

  Scenario: Verificar conteo de tareas vencidas
    Given que existen tareas con fecha de vencimiento pasada en estado "active"
    When solicito las estadísticas del sistema
    Then el campo "overdue_tasks" debe reflejar el número correcto de tareas vencidas

  Scenario: Obtener productividad por usuario
    Given que existen usuarios con tareas completadas y activas asignadas
    When solicito el endpoint GET /analytics/stats
    Then la respuesta debe incluir la lista de productividad por usuario
    And cada usuario debe mostrar sus tareas completadas, activas, costo total y horas completadas