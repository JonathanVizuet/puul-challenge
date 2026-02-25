Feature: Autenticación JWT
  Como usuario del sistema
  Quiero autenticarme con mi correo electrónico
  Para obtener acceso a los recursos protegidos de la API

  Scenario: Login exitoso con email registrado
    Given que existe un usuario registrado con email "jvizuetr@gmail.com"
    When envío una solicitud POST /auth/login con ese email
    Then el sistema debe responder con status 200
    And la respuesta debe contener un "access_token" JWT válido
    And el token debe incluir en su payload el id, nombre, email y rol del usuario

  Scenario: Login fallido con email no registrado
    Given que no existe ningún usuario con email "fantasma@puul.com"
    When envío una solicitud POST /auth/login con ese email
    Then el sistema debe responder con status 401 Unauthorized
    And el mensaje de error debe indicar que el usuario no existe

  Scenario: Acceder a ruta protegida sin token JWT
    Given que no incluyo ningún token en el header Authorization
    When intento hacer GET /users
    Then el sistema debe rechazar la petición con status 401 Unauthorized

  Scenario: Token generado contiene información correcta del usuario
    Given que existe un usuario con rol "admin"
    When ese usuario realiza login exitosamente
    Then el token generado debe contener su rol "admin" en el payload
    And el campo "sub" del payload debe corresponder al id del usuario