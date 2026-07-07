import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Customer name',
    example: 'João da Silva',
    minLength: 1,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(150)
  name: string;

  @ApiProperty({
    description: 'CPF (11 digits) or CNPJ (14 digits)',
    example: '52998224725',
    pattern: '^\\d{11}$|^\\d{14}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$|^\d{14}$/, { message: 'document must be 11 digits (CPF) or 14 digits (CNPJ)' })
  document: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'joao@example.com',
    maxLength: 254,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    description: 'Phone number (10 or 11 digits, digits only)',
    example: '11999887766',
    minLength: 10,
    maxLength: 11,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(11)
  @Matches(/^\d+$/, { message: 'phone must contain only digits' })
  phone: string;
}
