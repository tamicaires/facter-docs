# [FACTBP-API-015] Mail Service

> Serviço de envio de emails com templates.

---

## Status: ⏳ Pendente

## Contexto

**Necessário para:**
- Password recovery (reset-password)
- Welcome email (após registro)
- Convites para empresa
- Notificações (futuro)

**Stack:**
- Nodemailer para envio
- Handlebars para templates
- Queue (BullMQ) para envio assíncrono (opcional)

---

## Tasks

### Task 15.1: Instalar Dependências

**Comando:**
```bash
pnpm add nodemailer @nestjs-modules/mailer handlebars
pnpm add -D @types/nodemailer
```

**Commit:** `[FACTBP-API] chore(deps): add nodemailer and handlebars`

**Status:** ⏳

---

### Task 15.2: Criar Configuração de Email

**Arquivo:** `src/config/mail.config.ts`

**Implementação:**
```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  from: {
    name: process.env.MAIL_FROM_NAME || 'Facter',
    address: process.env.MAIL_FROM_ADDRESS || 'noreply@facter.com.br',
  },
}));
```

**Adicionar ao env.config.ts:**
```typescript
// Adicionar validação
MAIL_HOST: z.string().optional(),
MAIL_PORT: z.coerce.number().optional().default(587),
MAIL_SECURE: z.enum(['true', 'false']).optional().default('false'),
MAIL_USER: z.string().optional(),
MAIL_PASS: z.string().optional(),
MAIL_FROM_NAME: z.string().optional().default('Facter'),
MAIL_FROM_ADDRESS: z.string().email().optional(),
```

**Commit:** `[FACTBP-API] feat(config): add mail configuration`

**Status:** ⏳

---

### Task 15.3: Criar Mail Service

**Arquivo:** `src/infra/mail/mail.service.ts`

**Implementação:**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
    this.loadTemplates();
  }

  private initializeTransporter(): void {
    const mailConfig = this.configService.get('mail');

    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: mailConfig.auth.user
        ? {
            user: mailConfig.auth.user,
            pass: mailConfig.auth.pass,
          }
        : undefined,
    });
  }

  private loadTemplates(): void {
    const templatesDir = path.join(__dirname, 'templates');

    if (!fs.existsSync(templatesDir)) {
      this.logger.warn('Templates directory not found');
      return;
    }

    const files = fs.readdirSync(templatesDir);

    for (const file of files) {
      if (file.endsWith('.hbs')) {
        const templateName = file.replace('.hbs', '');
        const templatePath = path.join(templatesDir, file);
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        this.templates.set(templateName, handlebars.compile(templateContent));
      }
    }

    this.logger.log(`Loaded ${this.templates.size} email templates`);
  }

  async send(options: SendMailOptions): Promise<void> {
    const mailConfig = this.configService.get('mail');

    const template = this.templates.get(options.template);

    if (!template) {
      this.logger.error(`Template "${options.template}" not found`);
      throw new Error(`Email template "${options.template}" not found`);
    }

    const html = template(options.context);

    try {
      await this.transporter.sendMail({
        from: `"${mailConfig.from.name}" <${mailConfig.from.address}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html,
      });

      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}
```

**Commit:** `[FACTBP-API] feat(mail): add MailService with Nodemailer`

**Status:** ⏳

---

### Task 15.4: Criar Templates de Email

**Arquivo:** `src/infra/mail/templates/reset-password.hbs`

```handlebars
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .content {
      padding: 30px 0;
    }
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      color: #666;
      font-size: 12px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Facter</h1>
  </div>

  <div class="content">
    <h2>Olá, {{name}}!</h2>

    <p>Recebemos uma solicitação para redefinir sua senha.</p>

    <p>Clique no botão abaixo para criar uma nova senha:</p>

    <p style="text-align: center;">
      <a href="{{resetUrl}}" class="button">Redefinir Senha</a>
    </p>

    <p>Este link expira em <strong>{{expiresIn}}</strong>.</p>

    <p>Se você não solicitou a recuperação de senha, ignore este email.</p>
  </div>

  <div class="footer">
    <p>&copy; {{year}} Facter. Todos os direitos reservados.</p>
  </div>
</body>
</html>
```

---

**Arquivo:** `src/infra/mail/templates/welcome.hbs`

```handlebars
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao Facter</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .content {
      padding: 30px 0;
    }
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      color: #666;
      font-size: 12px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Facter</h1>
  </div>

  <div class="content">
    <h2>Bem-vindo, {{name}}!</h2>

    <p>Sua conta foi criada com sucesso.</p>

    <p>Empresa: <strong>{{companyName}}</strong></p>

    <p>Agora você pode acessar o sistema e começar a usar todos os recursos disponíveis.</p>

    <p style="text-align: center;">
      <a href="{{loginUrl}}" class="button">Acessar o Sistema</a>
    </p>
  </div>

  <div class="footer">
    <p>&copy; {{year}} Facter. Todos os direitos reservados.</p>
  </div>
</body>
</html>
```

---

**Arquivo:** `src/infra/mail/templates/invite.hbs`

```handlebars
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite para {{companyName}}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .content {
      padding: 30px 0;
    }
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      color: #666;
      font-size: 12px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Facter</h1>
  </div>

  <div class="content">
    <h2>Você foi convidado!</h2>

    <p>{{inviterName}} convidou você para fazer parte da empresa <strong>{{companyName}}</strong>.</p>

    <p>Função: <strong>{{roleName}}</strong></p>

    <p style="text-align: center;">
      <a href="{{inviteUrl}}" class="button">Aceitar Convite</a>
    </p>

    <p>Este convite expira em <strong>{{expiresIn}}</strong>.</p>
  </div>

  <div class="footer">
    <p>&copy; {{year}} Facter. Todos os direitos reservados.</p>
  </div>
</body>
</html>
```

**Commit:** `[FACTBP-API] feat(mail): add email templates`

**Status:** ⏳

---

### Task 15.5: Criar Mail Module

**Arquivo:** `src/infra/mail/mail.module.ts`

**Implementação:**
```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import mailConfig from '@/config/mail.config';

@Global()
@Module({
  imports: [ConfigModule.forFeature(mailConfig)],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
```

**Commit:** `[FACTBP-API] feat(mail): add MailModule`

**Status:** ⏳

---

### Task 15.6: Criar Mail Service para Desenvolvimento (Console)

**Arquivo:** `src/infra/mail/mail-dev.service.ts`

**Descrição:** Para desenvolvimento, apenas loga no console ao invés de enviar.

**Implementação:**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { SendMailOptions } from './mail.service';

@Injectable()
export class MailDevService {
  private readonly logger = new Logger('MailDevService');

  async send(options: SendMailOptions): Promise<void> {
    this.logger.log('='.repeat(50));
    this.logger.log('📧 EMAIL (DEV MODE - NOT SENT)');
    this.logger.log('='.repeat(50));
    this.logger.log(`To: ${options.to}`);
    this.logger.log(`Subject: ${options.subject}`);
    this.logger.log(`Template: ${options.template}`);
    this.logger.log(`Context: ${JSON.stringify(options.context, null, 2)}`);
    this.logger.log('='.repeat(50));
  }

  async verify(): Promise<boolean> {
    return true;
  }
}
```

**Atualizar mail.module.ts:**
```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailDevService } from './mail-dev.service';
import mailConfig from '@/config/mail.config';

const MailServiceProvider = {
  provide: 'MAIL_SERVICE',
  useFactory: (configService: ConfigService) => {
    const isDev = configService.get('NODE_ENV') === 'development';
    const hasMailConfig = !!configService.get('mail.auth.user');

    if (isDev && !hasMailConfig) {
      return new MailDevService();
    }
    return new MailService(configService);
  },
  inject: [ConfigService],
};

@Global()
@Module({
  imports: [ConfigModule.forFeature(mailConfig)],
  providers: [MailServiceProvider],
  exports: ['MAIL_SERVICE'],
})
export class MailModule {}
```

**Commit:** `[FACTBP-API] feat(mail): add dev mode for local development`

**Status:** ⏳

---

## Critérios de Aceite

- [ ] MailService envia emails via SMTP
- [ ] Templates Handlebars funcionam
- [ ] Modo dev loga no console
- [ ] Configuração via env vars
- [ ] Templates: reset-password, welcome, invite

---

## Arquivos a Criar

```
src/
├── config/
│   └── mail.config.ts
└── infra/
    └── mail/
        ├── mail.service.ts
        ├── mail-dev.service.ts
        ├── mail.module.ts
        └── templates/
            ├── reset-password.hbs
            ├── welcome.hbs
            └── invite.hbs
```

---

## Environment Variables

```bash
# .env.example
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM_NAME=Facter
MAIL_FROM_ADDRESS=noreply@facter.com.br
```

---

*Task de [Sprint 2](../sprint-02.md)*
