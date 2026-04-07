import { WASocket, WAMessage } from '@whiskeysockets/baileys';
import { config } from '../config/config.js';

export class Context {
    constructor(
        public socket: WASocket,
        public message: WAMessage
    ) {}

    get from(): string {
        return this.message.key.remoteJid || '';
    }

    get isGroup(): boolean {
        return this.from.endsWith('@g.us');
    }

    get sender(): string {
        return this.message.key.participant || this.from;
    }
    get username(): string {
        return this.message.pushName || '';
    }

    get text(): string {
        return (
            this.message.message?.conversation ||
            this.message.message?.extendedTextMessage?.text ||
            this.message.message?.imageMessage?.caption ||
            this.message.message?.videoMessage?.caption ||
            ''
        );
    }

    get command(): string {
        const prefix = config.bot.prefixo;
        const regex = new RegExp(`^${prefix}(\\w+)`);
        const match = this.text.match(regex);
        return match ? match[1].toLowerCase() : '';
    }

    get query(): string[] {
        const prefix = config.bot.prefixo;
        const textWithoutCommand = this.text.replace(new RegExp(`^${prefix}\\w+\\s*`), '');
        return textWithoutCommand.trim().split(/\s+/).filter(Boolean);
    }

    get caption(): string {
        return (
            this.message.message?.imageMessage?.caption ||
            this.message.message?.videoMessage?.caption ||
            ''
        );
    }

    async reply(text: string) {
        await this.socket.sendMessage(this.from, { text }, { quoted: this.message });
    }

    async send(text: string) {
        await this.socket.sendMessage(this.from, { text });
    }

    async sendImage(url: string, caption?: string) {
        await this.socket.sendMessage(this.from, {
            image: { url },
            caption,
        });
    }
    async sendVideo(url: string, caption?: string) {
        await this.socket.sendMessage(this.from, {
            video: { url },
            caption,
        });
    }
}
