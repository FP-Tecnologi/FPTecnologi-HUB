export interface AppConfig {
  port: number;
  database: {
    url: string;
  };
  jwt: {
    accessSecret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  otp: {
    expiresInMinutes: number;
  };
  resend: {
    apiKey: string;
    fromEmail: string;
  };
  mail: {
    driver: 'smtp' | 'resend';
    fromEmail: string;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      pass: string;
    };
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  otp: {
    expiresInMinutes: parseInt(process.env.OTP_EXPIRES_IN_MINUTES ?? '10', 10),
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY ?? '',
    fromEmail: process.env.RESEND_FROM_EMAIL ?? 'no-reply@fptecnologi.com',
  },
  mail: {
    driver: (process.env.MAIL_DRIVER as 'smtp' | 'resend') ?? 'smtp',
    fromEmail: process.env.MAIL_FROM_EMAIL ?? 'dev@fptecnologi.com',
    smtp: {
      host: process.env.SMTP_HOST ?? 'mail.fptecnologi.com',
      port: parseInt(process.env.SMTP_PORT ?? '465', 10),
      secure: (process.env.SMTP_SECURE ?? 'true') === 'true',
      user: process.env.SMTP_USER ?? '',
      pass: process.env.SMTP_PASS ?? '',
    },
  },
});
