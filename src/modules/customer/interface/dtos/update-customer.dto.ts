import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MaxLength, MinLength, Matches } from 'class-validator';

export class UpdateCustomerDto {
  @ApiPropertyOptional({
    description: 'Customer name',
    example: 'João da Silva',
    minLength: 1,
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({
    description: 'Customer email',
    example: 'joao@example.com',
    maxLength: 254,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number (10 or 11 digits, digits only)',
    example: '11999887766',
    minLength: 10,
    maxLength: 11,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(11)
  @Matches(/^\d+$/, { message: 'phone must contain only digits' })
  phone?: string;
}
