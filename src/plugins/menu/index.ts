import { Plugin } from '../../core/plugin.js';
import { Context } from '../../core/context.js';
import { config } from '../../config/config.js';

const menu: Plugin = {
    name: 'menu',
    commands: ['menu', 'help', 'ajuda'],

    async handle(context: Context): Promise<void> {
        await context.reply(`Olá *${context.username}*! Eu sou a *${config.bot.nome}* meu prefixo é *${config.bot.prefixo}*\n—\n Creditos: *${config.dono.nome}*`);
    },
};

export default menu;
