import { IsNotEmpty, IsString } from 'class-validator';

/** Used for /auth/totp/enable and /auth/totp/disable — code is a 6-digit TOTP or a backup code. */
export class TotpCodeDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
}
