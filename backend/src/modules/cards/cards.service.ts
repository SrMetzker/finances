import { Injectable, NotFoundException } from '@nestjs/common';
import { CardsRepository } from './cards.repository';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardsService {
  constructor(private readonly cardsRepository: CardsRepository) {}

  create(workspaceId: string, dto: CreateCardDto) {
    return this.cardsRepository.create(workspaceId, dto);
  }

  findAll(workspaceId: string) {
    return this.cardsRepository.findAll(workspaceId);
  }

  async findOne(workspaceId: string, id: string) {
    const card = await this.cardsRepository.findById(workspaceId, id);
    if (!card) throw new NotFoundException('Cartão não encontrado.');
    return card;
  }

  async update(workspaceId: string, id: string, dto: UpdateCardDto) {
    const result = await this.cardsRepository.update(workspaceId, id, dto);
    if (result.count === 0)
      throw new NotFoundException('Cartão não encontrado.');
    return this.findOne(workspaceId, id);
  }

  async remove(workspaceId: string, id: string) {
    const result = await this.cardsRepository.remove(workspaceId, id);
    if (result.count === 0)
      throw new NotFoundException('Cartão não encontrado.');
    return { deleted: true };
  }
}
