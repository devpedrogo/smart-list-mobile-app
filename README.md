# Smart List — Expo + React Native + Spring Boot

Projeto mobile em **React Native / Expo SDK 58**, com **Expo Router**, **TypeScript estrito**, **StyleSheet modular**, **Zustand**, **Axios**, **SecureStore**, **expo-location + expo-task-manager**, **expo-notifications** e **react-native-maps**.

O ZIP contém o projeto-fonte pronto para instalar dependências e integrar; **não inclui `node_modules`, build nativa/APK nem uma instância Spring Boot**. As imagens de referência fornecidas pelo usuário estão em `docs/referencias-visuais`.

## Executar (Node 22.13+)

```bash
npm install
copy .env.example .env
# Edite EXPO_PUBLIC_API_URL com o IP da máquina que roda o Spring Boot.
npx expo install --fix
npm run typecheck
npx expo start --go
```

No Android físico, abra o Expo Go e leia o QR Code. A localização em primeiro plano, os mapas e as notificações locais podem ser desenvolvidos no Expo Go; o geofencing em segundo plano requer um development build.

O `EXPO_PUBLIC_API_URL` deve conter o endereço **sem** `/api/v1`, por exemplo `http://192.168.0.10:8080`. `localhost` no celular aponta para o próprio celular. O build Android deste projeto permite HTTP usando `expo-build-properties` (`usesCleartextTraffic=true`) APENAS para facilitar a conexão com Spring Boot local em desenvolvimento. **Antes de distribuir o aplicativo em produção, altere para `false`, use HTTPS e reconstrua o binário.** O projeto não armazena senha ou token de autenticação.

### Geofencing em segundo plano

As tarefas de geofencing em background não são suportadas pelo Expo Go. O app permite testar telas, mapas, localização em primeiro plano e notificações locais nessa modalidade, sem tentar registrar a tarefa em background. Para validar alertas ao sair da residência e o layout Android customizado da notificação, use um development build (`npx expo run:android` ou `eas build --profile development --platform android`) em aparelho real. O layout apresenta ícones por categoria, pois a API não fornece imagens dos produtos. Autorize localização em uso, localização **o tempo todo** e notificações. Android 13+ requer consentimento explícito para notificações. Android pode atrasar eventos por economia de bateria e **não reinicia automaticamente o app encerrado por força** para executar tarefas de geofencing. No iOS, as regras do sistema também se aplicam. Nenhum alerta é garantido em todos os modelos de telefone.

## Árvore de pastas

```text
src/
  api/          client.ts, deviceId.ts, adapters.ts
  services/     shoppingListService.ts, settingsService.ts, residenceService.ts,
                notificationService.ts, locationService.ts, backgroundSnapshot.ts
  store/        useAppStore.ts, useSettingsStore.ts
  types/        shopping.ts, settings.ts
  utils/        format.ts, geometry.ts
  constants/    theme.ts, categories.ts
  ui/           PrimaryButton.tsx, TextField.tsx, BottomSheet.tsx, SettingSwitch.tsx
  domain/       ItemCard.tsx, CategoryChip.tsx, UnitChip.tsx
  components/   AppHeader.tsx, SnoozeSheet.tsx, PermissionRow.tsx, ScreenState.tsx
  tasks/        geofenceTask.ts
  app/          index.tsx, _layout.tsx, onboarding.tsx, item.tsx, residence.tsx,
                (tabs)/index.tsx, (tabs)/settings.tsx, (tabs)/_layout.tsx
```

## API e contratos (importante)

- **Nenhum login**. No primeiro acesso, `src/api/deviceId.ts` gera `Crypto.randomUUID()` e armazena no **SecureStore**. `src/api/client.ts` injeta `X-Device-ID` em TODAS as requisições (inclusive diagnóstico).
- Lista: `GET /shopping-items`, `POST /shopping-items`, `PUT /shopping-items/{id}`, `PATCH /shopping-items/{id}/toggle`, `DELETE /shopping-items/{id}`, `DELETE /shopping-items/completed`.
- Preferências: `GET/PUT /settings`, `GET /settings/diagnostic`, `GET /health`.
- Residência: `GET/POST /residence`, `POST /residence/check-geofence` (endpoint documentado e disponível no serviço, mas monitoramento nativo dispensa chamadas repetidas).
- Notificações: `POST /notifications/snooze` e `DELETE /notifications/snooze`.

Os contratos de escrita abaixo correspondem aos DTOs atuais do backend:

```json
POST /shopping-items
{"name":"Leite","quantity":"2 cx","category":"MERCADO"}

PUT /settings
{"remindOnLeave":true,"vibrateOnNotify":true,"notificationPermission":"PERMITIDO","locationPermission":"APENAS_DURANTE_USO"}

POST /residence
{"address":"Exemplo","latitude":-10.90,"longitude":-37.07,"geofenceActive":true}

POST /notifications/snooze
{"option":"MINUTES_30"}
```

O enum de soneca também aceita `HOUR_1`, `TOMORROW_MORNING` e `INDEFINITE`. A API fixa o raio residencial em 150 m. Para `GET /shopping-items`, a resposta contém `pendingItems` e `completedItems`; os IDs numéricos são normalizados como strings no app.

### Monitoramento de saída

1. O usuário concede permissões e salva um ponto residencial (raio fixo de 150 m, conforme o backend).
2. `locationService.syncRegistration()` registra uma região via `Location.startGeofencingAsync`. O `TaskManager.defineTask` fica no **topo do arquivo**, carregado pelo layout raiz.
3. A store atualiza `backgroundSnapshot.ts` com os itens pendentes, configurações, pausa e residência no AsyncStorage; o código da tarefa não depende de uma store React montada.
4. Ao receber **Enter**, a tarefa marca `inside=true`. Ao receber **Exit** após estado `inside=true`, confere lembretes habilitados, pausa e lista pendente, e emite notificação local. O app **não avisa retroativamente** se instalado quando já está fora do raio.
5. A notificação permite abrir a lista ou adiar 30 minutos. A ação de adiar abre o app e chama a API; não garante que o endpoint será chamado sem abrir o app. Quando o app é fechado à força no Android, a OS pode não executar a tarefa.

**Limitações/segurança:** UUID v4 é uma identificação estável de instalação, **não autenticação**. Se o backend aceitar `X-Device-ID` como único controle, qualquer um que obtenha esse valor poderá falsificar chamadas: use TLS, rate limiting e tratamento de dispositivos suspeitos. Reinstalação/limpeza do SecureStore pode alterar o ID. `SecureStore` pode persistir após reinstalação no iOS, conforme plataforma. A localização é tratada localmente para geofencing, mas a residência configurada é enviada ao backend conforme o requisito. O serviço usa um snapshot local que pode estar desatualizado até a próxima sincronização bem-sucedida com a API.

## Checklist de teste no aparelho

1. Instalar o development build; verificar se a base URL e o backend estão acessíveis pela mesma rede.
2. Confirmar no servidor que todas as chamadas têm o mesmo `X-Device-ID` e que o valor é um UUID válido.
3. Criar um item com quantidade string, editar, marcar/desmarcar, excluir e limpar concluídos.
4. Configurar endereço e raio; conceder permissões de foreground, background e notificações.
5. Com um item pendente e lembretes ativos, testar **com segurança durante um deslocamento normal**, cruzando o perímetro. Verificar abertura da lista e Snooze.
6. Testar bloqueio de tela, background, permissões negadas, pausa, retomada, sem itens pendentes, perda de rede e reinício do app.

## Fontes oficiais de compatibilidade

- Expo SDK 58: https://expo.dev/changelog
- Geofencing/limitações: https://docs.expo.dev/versions/v58.0.0/sdk/location/
- Notifications: https://docs.expo.dev/versions/latest/sdk/notifications/
- react-native-maps: https://docs.expo.dev/versions/v58.0.0/sdk/map-view/
- Router: https://docs.expo.dev/versions/latest/sdk/router/
