
# 📡 BancoUP API - Guía para Frontend

Esta API gestiona usuarios, autenticación, cuentas y transferencias. Se encuentra corriendo en el puerto `3000`.

---

## 🔐 Autenticación

### POST `/user/login`

**Body:**
```json
{
  "email": "usuario@correo.com",
  "password": "Contraseña123!"
}
```

**Response:**
```json
{
  "token": "JWT_TOKEN",
  "usuario": 1,
  "correo": "usuario@correo.com"
}
```

🔑 Guarda el token para incluirlo en los headers de las siguientes peticiones:

```
Authorization: Bearer JWT_TOKEN
```

---

## 👤 Usuario

### POST `/user/insert`

Registra un nuevo usuario.

**Body:**
```json
{
  "email": "nuevo@correo.com",
  "password": "ContrasenaSegura1!",
  "type": "cliente"
}
```

---

### GET `/user/profile`

Retorna los datos del perfil del usuario.

**Body:**
```json
{
  "id": 1
}
```

---

### GET `/user/users?blocked=1`

Devuelve usuarios filtrando por estado de bloqueo (`blocked=0` o `1`).
Undifined devuelve todo los usuarios

---

## 💸 Transferencias

### POST `/transaction/`

Realiza una transferencia.

**Body:**
```json
{
  "senderId": 1,
  "recipientAccountNumber": 2,
  "amount": 1500,
  "concept": "Pago de servicios"
}
```

**Restricciones:**
- Monto mínimo: $500
- Monto máximo: $10,000
- Límite diario por cuenta: $10,000
- Saldo máximo del receptor: $50,000

---

### GET `/transaction/account/:accountId`

Lista todas las transferencias donde el ID fue emisor o receptor.

---

## ⚠️ Errores comunes

- `403 Usuario bloqueado`: Más de 3 intentos fallidos de login.
- `400 Contraseña inválida`: No cumple con el formato requerido.
- `400 Límite diario excedido`: Se intentó transferir más de lo permitido por día.
- `400 Fondos insuficientes`: El emisor no tiene suficiente saldo.

---
## 🔒 Bloqueo de usuarios

### ¿Cómo funciona?

- Un usuario será **bloqueado automáticamente** después de **3 intentos fallidos de inicio de sesión**.
- Mientras esté bloqueado, cualquier intento de login devolverá:
  ```json
  {
    "message": "Usuario bloqueado"
  }
  ```
  con status `403`.

---

### GET `/user/users?blocked=1`

Devuelve todos los usuarios que están bloqueados. Puedes usar `blocked=0` para obtener los usuarios que **no están bloqueados**.

---

## 🛑 Bloquear usuario manualmente

### PATCH `/user/block/:id`

Bloquea manualmente a un usuario (por ejemplo, desde un panel de admin).



**URL Params:**
- `:id` → ID del usuario a bloquear

**Ejemplo de request:**
```
PATCH /user/block/3
Authorization: Bearer JWT_TOKEN
```

**Response:**
```json
{
  "message": "Usuario bloqueado exitosamente."
}
```


## ✅ Desbloquear usuario manualmente

### PATCH `/user/unlock/:id`

Desbloquea manualmente a un usuario (reinicia intentos fallidos y quita el estado de bloqueo).

**Requiere token en el header**.

**URL Params:**
- `:id` → ID del usuario a desbloquear

**Ejemplo de request:**
```
PATCH /user/unlock/3
Authorization: Bearer JWT_TOKEN
```

**Response:**
```json
{
  "message": "Usuario desbloqueado exitosamente"
}
```
¿Dudas? Pegúenle al backend 😎
