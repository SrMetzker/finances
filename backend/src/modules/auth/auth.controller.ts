import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const AUTH_COOKIE_NAME = 'auth_token';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    secure: isProd,
    path: '/',
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const payload = await this.authService.register(dto);
    res.cookie(AUTH_COOKIE_NAME, payload.accessToken, {
      ...getCookieOptions(),
      maxAge: ONE_DAY_MS,
    });
    return payload;
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const payload = await this.authService.login(dto);
    res.cookie(AUTH_COOKIE_NAME, payload.accessToken, {
      ...getCookieOptions(),
      maxAge: ONE_DAY_MS,
    });
    return payload;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME, getCookieOptions());

    return { ok: true };
  }
}
