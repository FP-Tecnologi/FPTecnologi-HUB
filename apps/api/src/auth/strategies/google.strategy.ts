import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, type Profile, type VerifyCallback } from 'passport-google-oauth20';
import type { AppConfig } from '../../config/configuration.js';

export interface GoogleProfile {
  email: string;
  nombre: string | null;
  avatarUrl: string | null;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const google = configService.get<AppConfig['google']>('google')!;
    super({
      clientID: google.clientId,
      clientSecret: google.clientSecret,
      callbackURL: google.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback): void {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(new Error('La cuenta de Google no devolvió un correo'), undefined);
      return;
    }
    const googleProfile: GoogleProfile = {
      email,
      nombre: profile.displayName || null,
      avatarUrl: profile.photos?.[0]?.value || null,
    };
    done(null, googleProfile);
  }
}
