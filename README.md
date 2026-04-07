# 🤖 Nex Bot - Melhor base para aprendizado / desenvolvimento!

> **Um bot WhatsApp open-source em TypeScript com arquitetura modular baseada em plugins.**

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Por Que TypeScript?](#por-que-typescript)
- [Arquitetura](#arquitetura)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Fluxo de Dados](#fluxo-de-dados)
- [Core System](#core-system)
- [Sistema de Plugins](#sistema-de-plugins)
- [Guia do Desenvolvedor](#guia-do-desenvolvedor)
- [Configuração](#configuração)
- [Referência de API](#referência-de-api)
- [Licença](#licença)
- [Contribuindo](#contribuindo)
- [Suporte](#suporte)

---

## Visão Geral

O Nex Bot é uma solução moderna para desenvolvimento de bots WhatsApp, construída com foco em:

- Type-safe: Tipagem estática com TypeScript
- Modular: Sistema de plugins auto-carregáveis
- Escalável: Arquitetura que cresce sem bagunça
- Moderno: ES Modules, sintaxe moderna do JS/TS

## Por Que TypeScript?

### Para Devs Migrando de JavaScript

| Aspecto | JavaScript | TypeScript |
|---------|-----------|------------|
| **Erros** | Em runtime | Em tempo de compilação |
| **Autocompletar** | Limitado | IntelliSense completo |
| **Refatoração** | Arriscada | Segura |
| **Documentação** | Comentários | Tipos são documentação |

### Benefícios Deste Projeto

1. **Segurança de Tipos**: A interface `Plugin` garante que todo plugin tenha a estrutura correta
2. **Autocomplete**: IDE sugere métodos disponíveis no `Context`
3. **Refatoração**: Mudar o nome de uma propriedade? Altera em todos os lugares automaticamente
4. **Self-documenting**: Os tipos dizem exatamente o que cada função espera e retorna

---

## Estrutura de Pastas

```
nex-bot/
├── package.json              # Configuração do projeto
├── tsconfig.json             # Configuração TypeScript
├── README.md                 # Documentação básica
├── .gitignore               # Arquivos ignorados pelo git
│
├── src/                     # Código-fonte (TypeScript)
│   ├── index.ts             # Ponto de entrada do bot
│   │
│   ├── config/              # Configurações
│   │   └── config.ts        # Config do bot (nome, prefixo, dono)
│   │
│   ├── core/                # Núcleo do sistema
│   │   ├── plugin.ts        # Interface Plugin (contrato)
│   │   ├── context.ts       # Classe Context (contexto da msg)
│   │   ├── plugin-manager.ts # Gerenciador de plugins
│   │   ├── logger.ts        # Logger colorido com chalk
│   │   └── message-logger.ts # Log de mensagens recebidas
│   │
│   └── plugins/             # Plugins (cada pasta = um comando)
│       ├── ping/            # Plugin ping
│       │   └── index.ts
│       └── menu/            # Plugin menu
│           └── index.ts
│
└── dist/                    # Código compilado (JavaScript)
    └── (gerado automaticamente)
```

---

## Fluxo de Dados

### Inicialização

```
1. npm run dev
2. TypeScript compila src/ → dist/
3. Node executa dist/index.js
4. WhatsAppBot.start() é chamado
5. PluginManager carrega todos os plugins de src/plugins/
6. Baileys conecta ao WhatsApp Web
7. QR Code é exibido no terminal
8. Usuário escaneia o QR Code
9. Bot conectado e pronto!
```

### Recebimento de Mensagem

```
1. WhatsApp envia mensagem
2. Baileys dispara evento 'messages.upsert'
3. WhatsAppBot.handleMessage() é chamado
4. Context é criado (encapsula socket + mensagem)
5. logMessage() registra a mensagem no console
6. PluginManager.processMessage() recebe o context
7. Manager itera pelos plugins carregados
8. Plugin correspondente ao comando é executado
9. Resposta é enviada de volta ao usuário
```

---

## Core System

### Interface Plugin (`src/core/plugin.ts`)

```typescript
export interface Plugin {
    name: string;           // Nome amigável do plugin
    commands: string[];     // Array de comandos que ativam este plugin
    handle(context: Context): Promise<void>;  // Função executada
}
```

**Obrigações de todo plugin:**
- Ter um `name` identificável
- Definir quais `commands` ele responde
- Implementar `handle()` que recebe Context e faz algo

### Classe Context (`src/core/context.ts`)

A classe Context é a **ponte** entre o plugin e o WhatsApp. Ela abstrai a complexidade da Baileys.

#### Propriedades

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `socket` | `WASocket` | Conexão ativa com WhatsApp |
| `message` | `WAMessage` | Mensagem bruta da Baileys |
| `from` | `string` | ID do chat (ex: "5511999999999@s.whatsapp.net") |
| `isGroup` | `boolean` | É um grupo? |
| `sender` | `string` | Quem enviou a mensagem |
| `text` | `string` | Texto da mensagem |
| `command` | `string` | Comando detectado (sem prefixo) |
| `query` | `string[]` | Argumentos após o comando |
| `caption` | `string` | Legenda de imagem/vídeo |

#### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `reply(text)` | `string` | Responde citando a mensagem original |
| `send(text)` | `string` | Envia mensagem simples |
| `sendImage(url, caption?)` | `string, string?` | Envia imagem |
| `sendVideo(url, caption?)` | `string, string?` | Envia vídeo |

**Exemplo de uso no plugin:**
```typescript
async handle(context: Context): Promise<void> {

    await context.reply(`Olá ${context.sender}!`);
    await context.sendImage('https://exemplo.com/foto.jpg', 'Legenda');
}
```

### PluginManager (`src/core/plugin-manager.ts`)

O PluginManager é o **cérebro** do sistema de plugins.

#### Responsabilidades

1. **Auto-descoberta**: Escaneia `src/plugins/` em busca de plugins
2. **Carregamento dinâmico**: Usa `import()` para carregar cada plugin
3. **Roteamento**: Envia comandos para o plugin correto
4. **Isolamento**: Erro em um plugin não quebra os outros

#### Como funciona o carregamento

```typescript
async loadPlugins(): Promise<void> {
    // 1. Lê a pasta src/plugins/
    const entries = await readdir(this.pluginsDir);
    
    // 2. Para cada pasta/arquivo...
    for (const entry of entries) {
        // 3. Tenta importar o index.js
        const module = await import('file://' + indexPath);
        
        // 4. Verifica se é um plugin válido (tem export default)
        if (module.default && typeof module.default === 'object') {
            const plugin = module.default as Plugin;
            this.plugins.push(plugin);
            console.log(`✓ ${plugin.name} carregado`);
        }
    }
}
```

---

## Sistema de Plugins

### Criando um Novo Plugin

#### Passo 1: Criar a pasta

```bash
mkdir src/plugins/meu-plugin
```

#### Passo 2: Criar index.ts

```typescript
import { Plugin } from '../../core/plugin.js';
import { Context } from '../../core/context.js';

const MeuPlugin: Plugin = {
    name: 'Meu Plugin',
    commands: ['meucomando', 'mc', 'comando'],
    
    async handle(context: Context): Promise<void> {
        await context.reply('Funcionou!');
    },
};

export default MeuPlugin;
```

#### Passo 3: Recompilar

```bash
npm run build
# ou
npm run dev
```

#### Passo 4: Testar

No WhatsApp, envie: `/meucomando`

---

## Guia do Desenvolvedor

### Pré-requisitos

- Node.js 20+
- npm ou yarn
- Git (opcional)

### Configuração Inicial

```bash
# 1. Clone o repositório
git clone https://github.com/bielzzxy7/nex-bot.git
cd nexbot

# 2. Instale dependências
npm install

# 3. Configure o bot (opcional)
# Edite src/config/config.ts

# 4. Compile e execute
npm run dev
```

### Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run build` | Compila TypeScript para JavaScript |
| `npm run start` | Executa o bot (requer build antes) |
| `npm run dev` | Compila e executa em um comando |
| `npm run watch` | Compila automaticamente ao salvar arquivos |

---

## Configuração

### Arquivo `src/config/config.ts`

```typescript
export const config = {
    bot: {
        nome: 'Nex Bot',           
        version: '1.0.0',         
        prefixo: '/',             
    },
    dono: {
        nome: 'Seu nome',        
        numero: '5599999999999'   
    },
};

## Licença

MIT - Use, modifique, distribua livremente!

---

## Contribuindo

1. Faça um fork do projeto
2. Crie sua branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## Suporte

- **WhatsApp:** [Clique aqui](https://wa.me/5598985568495)

---

<p align="center">
  <strong>Feito com ❤️ pelo BIEL</strong>
</p>

> *"Sair do JavaScript foi a melhor decisão que tomei como dev. TypeScript não é só tipagem, é uma experiência de desenvolvimento completamente superior."*
