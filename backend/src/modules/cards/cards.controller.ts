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
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('cards')
@UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  create(@WorkspaceId() wid: string, @Body() dto: CreateCardDto) {
    return this.cardsService.create(wid, dto);
  }

  @Get()
  findAll(@WorkspaceId() wid: string) {
    return this.cardsService.findAll(wid);
  }

  @Get(':id')
  findOne(@WorkspaceId() wid: string, @Param('id') id: string) {
    return this.cardsService.findOne(wid, id);
  }

  @Patch(':id')
  update(
    @WorkspaceId() wid: string,
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
  ) {
    return this.cardsService.update(wid, id, dto);
  }

  @Delete(':id')
  remove(@WorkspaceId() wid: string, @Param('id') id: string) {
    return this.cardsService.remove(wid, id);
  }
}
