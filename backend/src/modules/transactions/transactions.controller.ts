import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceAccessGuard } from '../../common/guards/workspace-access.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @WorkspaceId() wid: string,
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(wid, user.sub, dto);
  }

  @Get()
  findAll(
    @WorkspaceId() wid: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.transactionsService.findAll(
      wid,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  @Get(':id')
  findOne(@WorkspaceId() wid: string, @Param('id') id: string) {
    return this.transactionsService.findOne(wid, id);
  }

  @Patch(':id')
  update(
    @WorkspaceId() wid: string,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(wid, id, dto);
  }

  @Delete(':id')
  remove(@WorkspaceId() wid: string, @Param('id') id: string) {
    return this.transactionsService.remove(wid, id);
  }
}
