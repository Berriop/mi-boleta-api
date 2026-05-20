import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { GAME_TYPES, GameType, TICKET_STATUSES, TicketStatus } from '../../../domain/entities/Ticket';

export class CreateTicketDto {
  @IsString({ message: 'El título debe ser texto' })
  @Length(1, 120, { message: 'El título debe tener entre 1 y 120 caracteres' })
  title!: string;

  @IsIn(GAME_TYPES as unknown as string[], {
    message: `gameType debe ser uno de: ${GAME_TYPES.join(', ')}`,
  })
  gameType!: GameType;

  @IsOptional()
  @IsString({ message: 'gameNumber debe ser texto' })
  @Length(1, 50, { message: 'gameNumber debe tener entre 1 y 50 caracteres' })
  gameNumber?: string;

  @Type(() => Date)
  @IsDate({ message: 'gameDate debe ser una fecha válida (ISO 8601)' })
  gameDate!: Date;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'amount debe ser numérico' })
  @Min(0, { message: 'amount no puede ser negativo' })
  amount?: number;

  @IsOptional()
  @IsString({ message: 'place debe ser texto' })
  @Length(1, 120, { message: 'place debe tener entre 1 y 120 caracteres' })
  place?: string;

  @IsIn(TICKET_STATUSES as unknown as string[], {
    message: `status debe ser uno de: ${TICKET_STATUSES.join(', ')}`,
  })
  status!: TicketStatus;

  @IsOptional()
  @IsString({ message: 'notes debe ser texto' })
  @Length(0, 1000, { message: 'notes no puede exceder 1000 caracteres' })
  notes?: string;
}
