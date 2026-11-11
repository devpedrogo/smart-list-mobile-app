# 🛒 Smart List

Aplicativo mobile para organizar compras e ajudar você a não esquecer itens pendentes ao sair de casa. O Smart List combina uma lista de compras com um lembrete por geofence: quando o sistema detecta que o aparelho saiu da residência configurada, o app pode exibir uma notificação com os itens que ainda faltam.

> **Este repositório contém o aplicativo mobile.** A API Spring Boot é um serviço separado e precisa estar em execução para carregar e alterar a lista, as preferências e a residência. O projeto não inclui uma instância do backend, `node_modules` ou um APK pronto.

## ✨ O que o aplicativo faz

- 📝 Adiciona e edita produtos com nome, quantidade livre (por exemplo, `2 un` ou `500 g`) e categoria.
- ✅ Separa itens pendentes dos comprados; permite marcar, desmarcar, excluir e limpar os itens concluídos.
- 🏠 Configura uma residência usando a localização do aparelho ou um ponto escolhido no mapa.
- 📍 Monitora a saída do perímetro residencial e pode avisar quando ainda existem compras pendentes.
- 🔔 Permite pausar os lembretes por 30 minutos, 1 hora, até a manhã seguinte ou manualmente.
- ⚙️ Mantém preferências de lembrete e vibração, e apresenta o estado de permissões e conectividade.
- 🔐 Gera um identificador UUID por instalação e o armazena no armazenamento seguro do dispositivo.

O cadastro e a manutenção da lista exigem conexão com a API. A localização não é necessária para usar essas funções: sem conceder essa permissão, o usuário ainda pode trabalhar com a lista, mas o lembrete por saída de casa não será ativado.

## 🧰 Tecnologias

- **React Native** e **Expo SDK 58**
- **TypeScript** com verificação de tipos
- **Expo Router** para navegação baseada em arquivos
- **Zustand** para estado compartilhado
- **Axios** para comunicação HTTP
- **AsyncStorage** para dados locais usados no onboarding e nas tarefas em segundo plano
- **Expo SecureStore** para o identificador do dispositivo
- **Expo Location** e **Expo Task Manager** para localização e geofencing
- **Expo Notifications** para notificações locais
- **React Native Maps** para selecionar a residência
- Módulo nativo Android local para a apresentação customizada de notificações

## 🚀 Começando

### Pré-requisitos

- Node.js **22.13 ou superior**
- npm
- Android Studio e Android SDK para executar em emulador ou aparelho Android
- Xcode para executar a versão iOS (macOS)
- Uma API Spring Boot compatível com os contratos descritos em [`docs/INTEGRACAO_BACKEND.md`](./docs/INTEGRACAO_BACKEND.md)

### 1. Instale as dependências

Na pasta do projeto:

```bash
npm install
npx expo install --fix
```

O segundo comando alinha as dependências Expo com as versões esperadas pelo SDK do projeto.

### 2. Configure a API

Crie um arquivo `.env` na raiz do projeto e configure a URL base do backend:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.0.10:8080
```

Substitua o endereço e a porta pelos valores do seu ambiente. Informe a **origem** da API, sem acrescentar `/api/v1`; o cliente do aplicativo adiciona esse prefixo automaticamente.

| Ambiente | Exemplo de endereço |
|---|---|
| Android Emulator | `http://10.0.2.2:8080` |
| Aparelho físico na mesma rede do computador | `http://IP_DO_COMPUTADOR:8080` |
| Outro ambiente | URL acessível pelo aparelho, preferencialmente com HTTPS |

`localhost` em um aparelho físico aponta para o próprio aparelho, não para o computador que executa o backend. Verifique também se o servidor aceita conexões da rede e se o firewall permite o acesso.

> ⚠️ O projeto permite tráfego HTTP no Android para facilitar o desenvolvimento local. Antes de distribuir uma versão, use HTTPS e desative o tráfego sem criptografia na configuração nativa. A variável `EXPO_PUBLIC_*` é incorporada ao aplicativo; não coloque nela senhas, tokens ou outros segredos.

### 3. Inicie o aplicativo

Para abrir no Expo Go:

```bash
npm start
```

Ou, diretamente:

```bash
npx expo start --go
```

Leia o QR Code com o Expo Go ou inicie um emulador a partir do terminal do Expo.

### 4. Execute verificações

```bash
npm run typecheck
npm run doctor
```

## 🐳 Executar a versão web com Docker

O Docker publica a exportação web do Expo como arquivos estáticos. Esse modo é voltado a navegadores; recursos nativos como geofencing em segundo plano e permissões do Android/iOS continuam dependendo de uma instalação nativa do aplicativo.

Configure a origem da API em `.env` (sem `/api/v1`) e inicie o serviço:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.0.10:8080
```

```bash
docker compose up --build -d
```

Acesse `http://localhost:8080`. Para alterar a porta publicada, defina `FRONTEND_PORT` no `.env`. A URL da API é incorporada durante o build; execute novamente `docker compose up --build` após alterá-la. Como as chamadas à API são feitas pelo navegador, configure um endereço que também seja acessível pelo computador do usuário — por exemplo, o IP da máquina que executa o backend na rede local — e não um nome de host visível somente dentro do Docker.

O container Nginx roda sem root, descarta capabilities e usa filesystem somente leitura; não precisa de `privileged`, acesso a dispositivos nem permissões adicionais no host.

Os scripts disponíveis estão definidos em [`package.json`](./package.json):

| Comando | Finalidade |
|---|---|
| `npm start` | Inicia o Expo Go |
| `npm run android` | Compila e executa no Android com o ambiente nativo local |
| `npm run ios` | Compila e executa no iOS (requer macOS e Xcode) |
| `npm run typecheck` | Executa `tsc --noEmit` |
| `npm run doctor` | Verifica a configuração do projeto Expo |
| `npm run fix-deps` | Ajusta as versões das dependências Expo |

## 📲 Como usar

1. **Boas-vindas:** escolha configurar a residência agora ou começar pela lista e configurar depois.
2. **Lista:** crie itens, informe quantidades e categorias, e marque os produtos conforme forem comprados.
3. **Residência:** permita o acesso à localização, selecione o ponto residencial e salve o endereço.
4. **Lembretes:** permita notificações e, para monitorar saídas em segundo plano, autorize a localização o tempo todo.
5. **Pausa:** na lista, toque em **Pausar** para escolher por quanto tempo suspender os avisos; use **Reativar** para retomá-los antes do prazo.

O perímetro residencial tem raio de **150 metros**, valor definido pela API. A tela de residência pode mostrar o mapa e o endereço associado às coordenadas configuradas.

## 🧭 Como funciona por dentro

### Lista e estado do aplicativo

As telas Expo Router chamam as stores Zustand, que coordenam as operações e mantêm os dados exibidos. A store da lista usa `shoppingListService` para consultar ou alterar itens na API; após uma alteração bem-sucedida, atualiza os grupos de pendentes e concluídos. A store de configurações carrega preferências, residência, permissões e estado dos lembretes.

### Comunicação com o backend

O cliente Axios usa a URL configurada em `EXPO_PUBLIC_API_URL`, acrescenta `/api/v1` e injeta o cabeçalho `X-Device-ID` em cada chamada. O identificador é criado com UUID e salvo pelo SecureStore. **Ele identifica uma instalação, mas não autentica o usuário.** A API deve aplicar os controles de segurança apropriados e usar HTTPS em produção.

Principais rotas usadas pelo app:

| Recurso | Operações |
|---|---|
| Itens de compra | `GET` e `POST /shopping-items`; `PUT`, `PATCH .../toggle` e `DELETE /shopping-items/{id}`; `DELETE /shopping-items/completed` |
| Preferências | `GET` e `PUT /settings`; `GET /settings/diagnostic` |
| Saúde da API | `GET /health` |
| Residência | `GET` e `POST /residence`; `POST /residence/check-geofence` |
| Pausa de lembretes | `POST` e `DELETE /notifications/snooze` |

O contrato detalhado, exemplos de payload e enums aceitos estão em [`docs/INTEGRACAO_BACKEND.md`](./docs/INTEGRACAO_BACKEND.md).

### Lembrete de saída de casa

1. O app precisa de uma residência salva, lembretes ativos e permissões de localização e notificação compatíveis com o sistema.
2. `locationService` registra a região residencial com `Location.startGeofencingAsync`. A tarefa `geofenceTask` é definida no escopo do módulo e carregada pelo layout raiz.
3. A lista pendente, as preferências, a residência e a pausa são gravadas em um snapshot local. Assim, a tarefa em background não depende de uma store React estar montada.
4. Ao entrar na região, o app atualiza o estado de presença. Uma saída posterior pode gerar a notificação se ainda houver itens pendentes e os lembretes não estiverem pausados.
5. A notificação permite abrir a lista e, no Android nativo, oferece ações para adiar ou dispensar. A ação de adiar sincroniza a pausa com o backend quando o app é aberto.

O app não envia um aviso retroativo se for iniciado quando o aparelho já estiver fora da região. O snapshot local também pode ficar desatualizado até que uma sincronização com a API seja concluída.

## 🔔 Expo Go e development build

O **Expo Go** permite desenvolver e testar as telas, a lista, a localização em primeiro plano e notificações locais. Porém, ele não carrega o módulo Android customizado deste projeto e **não oferece suporte ao geofencing em segundo plano**.

Para testar o fluxo real de saída de casa e o layout Android customizado, instale um development build em um aparelho:

```bash
npx expo run:android
```

Ou crie um build interno com EAS:

```bash
eas build --profile development --platform android
```

O EAS CLI precisa estar instalado e configurado para o segundo comando. Para o teste, conceda localização em primeiro plano, localização em segundo plano (**o tempo todo**) e notificações. No Android 13 ou superior, notificações dependem de autorização explícita.

### Limitações do sistema operacional

- Android e iOS podem atrasar ou limitar eventos de localização em background por economia de bateria, permissões ou políticas do sistema.
- No Android, encerrar o app por força pode impedir que a tarefa de geofence volte a ser executada automaticamente.
- No iOS, a execução também está sujeita às regras do sistema e ao estado das permissões.
- Nenhum sistema garante que o evento de saída ou a notificação ocorrerá em um prazo exato em todos os aparelhos.
- A notificação Android customizada exibe ícones de categoria, pois a API não fornece imagens dos produtos. No Expo Go e no iOS é usada a apresentação padrão do Expo Notifications.

## 🗂️ Estrutura do projeto

```text
src/
├── api/          # Cliente HTTP, identificador do dispositivo e adaptação dos DTOs
├── app/          # Rotas e telas do Expo Router
│   └── (tabs)/   # Lista e configurações
├── components/   # Componentes de tela compartilhados
├── constants/    # Categorias e tema visual
├── domain/       # Componentes de domínio, como cartões e chips de item
├── services/     # Lista, configurações, residência, localização e notificações
├── store/        # Stores Zustand da lista e das configurações
├── tasks/        # Tarefa de geofencing em segundo plano
├── types/        # Tipos TypeScript do domínio
├── ui/           # Componentes básicos de interface
└── utils/        # Formatação e utilitários geométricos

modules/
└── smart-list-notifications/  # Módulo nativo Android de notificações

docs/
├── INTEGRACAO_BACKEND.md      # Contratos e detalhes da integração
└── referencias-visuais/       # Imagens de referência do projeto
```

## 🔒 Privacidade e segurança

- O UUID do dispositivo é estável para a instalação, mas **não deve ser tratado como credencial**.
- A residência é enviada à API para persistência e configuração. O monitoramento do perímetro é realizado pelo sistema de localização do aparelho.
- Limpar dados ou reinstalar o app pode alterar o identificador; o comportamento de persistência do SecureStore varia entre plataformas.
- Em produção, use HTTPS, revise a configuração de tráfego HTTP e proteja os endpoints no backend. Não há fluxo de login ou autenticação implementado neste aplicativo.
- Conceda somente as permissões necessárias. A lista pode ser utilizada sem localização, mas o lembrete de saída depende dela.

## 🧪 Sugestão de validação em aparelho

1. Inicie o backend e confirme que o telefone consegue acessar a URL configurada.
2. Execute o app e crie, edite, conclua e exclua um item.
3. Configure a residência e verifique as permissões na tela de configurações.
4. Em um development build, deixe um item pendente e os lembretes ativos; teste a saída do perímetro durante um deslocamento normal.
5. Teste também lembretes pausados, lista sem itens pendentes, permissões negadas, perda de rede, app em segundo plano e reinício.

Não é necessário simular deslocamentos arriscados: faça esses testes apenas durante um trajeto seguro e normal.

## 📚 Referências

- [Expo SDK 58](https://expo.dev/changelog)
- [Expo Location e geofencing](https://docs.expo.dev/versions/v58.0.0/sdk/location/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Native Maps](https://docs.expo.dev/versions/v58.0.0/sdk/map-view/)
- [Expo Router](https://docs.expo.dev/versions/latest/sdk/router/)
