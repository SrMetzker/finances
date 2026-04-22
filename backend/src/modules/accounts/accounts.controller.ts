import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceAccessGuard } from '../../common/guards/workspace-access.guard';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
@UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@WorkspaceId() wid: string, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(wid, dto);
  }

  @Get()
  findAll(@WorkspaceId() wid: string) {
    return this.accountsService.findAll(wid);
  }

  @Get(':id')
  findOne(@WorkspaceId() wid: string, @Param('id') id: string) {
    return this.accountsService.findOne(wid, id);
  }

  @Patch(':id')
  update(
    @WorkspaceId() wid: string,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(wid, id, dto);
  }

  @Delete(':id')
  remove(@WorkspaceId() wid: string, @Param('id') id: string) {
    return this.accountsService.remove(wid, id);
  }
}
