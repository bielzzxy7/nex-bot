import { Context } from './context.js';
import chalk from 'chalk';

export function logMessage(context: Context): void {
    const type = getMessageType(context);
    const from = context.isGroup ? 'grupo' : 'privado';
    const sender = context.sender.split('@')[0];
    
    var content = '';
    if (type === 'comando') {
        content = `comando usado → ${context.command}`;
        if (context.query.length > 0) content += ` | query → ${context.query.join(' ')}`;
    } else if (['imagem', 'video'].includes(type) && context.caption) {
        content = `caption → "${context.caption}"`;
    } else {
        content = `Mensagem → "${context.text.substring(0, 50)}${context.text.length > 50 ? '...' : ''}"`;
    }

    const typeLabel = chalk.green.bold(`[${type.toUpperCase()}]`);
    const fromLabel = chalk.gray.bold(`(${from})`);
    const senderLabel = chalk.white.bold(sender);
    const contentLabel = chalk.white.bold(content);
    console.log(`${typeLabel} de ${senderLabel} ${fromLabel} → ${contentLabel}`);
}

function getMessageType(context: Context): string {
    if (context.command) return 'comando';
    if (context.message.message?.imageMessage) return 'imagem';
    if (context.message.message?.videoMessage) return 'video';
    if (context.message.message?.audioMessage) return 'audio';
    if (context.message.message?.documentMessage) return 'documento';
    if (context.message.message?.stickerMessage) return 'sticker';
    if (context.message.message?.locationMessage) return 'localizacao';
    if (context.message.message?.contactMessage) return 'contato';
    return 'mensagem';
}
