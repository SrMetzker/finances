import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@CurrentUser() user: { sub: string }) {
    return this.usersService.getPublicProfile(user.sub);
  }

  @Patch('me/profile')
  updateProfile(
    @CurrentUser() user: { sub: string },
    @Body() body: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, body);
  }

  @Patch('me/password')
  changePassword(
    @CurrentUser() user: { sub: string },
    @Body() body: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.sub, body);
  }

  @Post('me/reset-data')
  resetData(@CurrentUser() user: { sub: string }) {
    return this.usersService.resetData(user.sub);
  }

  @Delete('me')
  deleteAccount(
    @CurrentUser() user: { sub: string },
    @Body() body: DeleteAccountDto,
  ) {
    return this.usersService.deleteAccount(user.sub, body);
  }
}
