# Contrato de integração com a API Spring Boot

O cliente usa `EXPO_PUBLIC_API_URL` como origem do servidor, acrescenta `/api/v1` e envia `X-Device-ID` em cada requisição. Os contratos abaixo correspondem aos controllers e DTOs da API.

## Lista de compras

- `GET /shopping-items` retorna `pendingItems` e `completedItems`, além das contagens.
- `POST /shopping-items` e `PUT /shopping-items/{id}` recebem `{name, quantity, category}`. A categoria é o enum em maiúsculas, por exemplo `MERCADO` ou `HORTIFRUTI`.
- `PATCH /shopping-items/{id}/toggle`, `DELETE /shopping-items/{id}` e `DELETE /shopping-items/completed` alteram a lista.
- As categorias da interface são convertidas para os enums `ItemCategoryEnum` da API.

## Preferências e permissões

`GET /settings` e `PUT /settings` usam `remindOnLeave`, `vibrateOnNotify`, `notificationPermission` e `locationPermission`. O app converte as preferências da interface e consulta as permissões atuais do sistema antes de salvar:

```json
{
  "remindOnLeave": true,
  "vibrateOnNotify": true,
  "notificationPermission": "PERMITIDO",
  "locationPermission": "APENAS_DURANTE_USO"
}
```

Os enums são `PERMITIDO`/`NEGADO` para notificações e `SEMPRE_PERMITIDA`/`APENAS_DURANTE_USO`/`NEGADO` para localização. `GET /settings/diagnostic` retorna o diagnóstico registrado no backend; o estado atual das permissões exibido pela interface é consultado no aparelho.

## Residência e geofence

- `GET /residence` retorna HTTP 404 quando ainda não existe residência; o app interpreta esse status como ausência de configuração.
- `POST /residence` recebe `address`, `latitude`, `longitude` e `geofenceActive`. A API fixa o raio em **150 metros**; o app exibe esse valor e não oferece um controle de raio que o servidor ignoraria.
- `POST /residence/check-geofence` recebe `{currentLatitude, currentLongitude}`.
- Geofencing nativo em segundo plano continua sendo responsabilidade do development build; o Expo Go pode testar localização em primeiro plano.
- A notificação Android customizada usa um módulo nativo local. O Android exibe os três primeiros produtos com ícones por categoria (a API não fornece fotos), botões para abrir, adiar e dispensar; Expo Go e iOS usam a apresentação padrão do Expo Notifications.
- O layout da notificação Android só pode ser validado em um development build instalado. O sistema operacional e as configurações de privacidade da tela bloqueada podem variar o resultado.

## Soneca

`POST /notifications/snooze` recebe um enum `option`: `MINUTES_30`, `HOUR_1`, `TOMORROW_MORNING` ou `INDEFINITE`. `DELETE /notifications/snooze` reativa os lembretes.

Erros HTTP preservam o status e a mensagem da API; os erros de validação do Spring também incluem os detalhes dos campos.

## Observações

- A lista é útil mesmo sem aceitar geolocalização, com alerta claro de permissão pendente.
- O mapa só aparece depois que existe coordenada (não usa endereço fictício).
- O raio residencial é fixo em 150 m, conforme implementação atual do backend.
- Os estados de pausa estão no armazenamento local para o processamento do geofence; os endpoints de soneca também persistem a pausa no backend.
- Android, incluindo Android 14+, exige permissão de localização em segundo plano e poderá restringir eventos para economia de bateria.
