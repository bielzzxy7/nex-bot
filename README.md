# Bot WhatsApp - Nex Bot

Bot WhatsApp modular usando Baileys com sistema de plugins baseado em ES modules.

## 🚀 Começando

```bash
# Instalar dependências
npm install

# Compilar TypeScript
npm run build

# Iniciar o bot
npm start

# Ou em modo desenvolvimento
npm run dev
```

## 📁 Estrutura

```
src/
├── index.ts              # Ponto de entrada
├── core/
│   ├── context.ts        # Contexto da mensagem
│   ├── logger.ts         # Logger
│   ├── plugin.ts         # Interface do plugin
│   └── plugin-manager.ts # Gerenciador de plugins
└── plugins/
    ├── ping/             # Plugin ping
    └── menu/             # Plugin menu
```

# Como fazer um plugin

1. Crie uma pasta dentro de `src/plugins/` com o nome do seu plugin
2. Crie um arquivo `index.ts` dentro da pasta com a seguinte estrutura:

```typescript
import { Plugin } from '../../core/plugin.js';
import { Context } from '../../core/context.js';

const Menu: Plugin = {
    name: 'Menu',
    commands: ['menu', 'help', 'ajuda'], // comandos que o bot vai reconhecer!

    async handle(context: Context): Promise<void> {
        await context.reply('Nex bot - Seu assistente inteligente');
    },
};

export default Menu;
```

3. Recompile com `npm run build`
4. O plugin será carregado automaticamente

# Seja feliz!

## ⚠️ Notas

- Requer Node.js 20+
- Usa ES modules (`"type": "module"`)
- TypeScript para tipagem segura


<p align="center">
  <strong>Feito com ❤️ pelo BIEL</strong>
</p>

> *"Sair do JavaScript foi a melhor decisão que tomei como dev. TypeScript não é só tipagem, é uma experiência de desenvolvimento completamente superior."*


  ## Créditos

-  [![Instagram](https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png)](https://instagram.com/not.biel) Biel
