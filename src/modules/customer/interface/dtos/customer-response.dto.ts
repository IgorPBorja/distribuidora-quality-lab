import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ description: 'Customer UUID', format: 'uuid', example: 'b1c2d3e4-f5a6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Customer name', example: 'João da Silva' })
  name: string;

  @ApiProperty({ description: 'CPF (11 digits) or CNPJ (14 digits)', example: '52998224725' })
  document: string;

  @ApiProperty({ description: 'Customer email', format: 'email', example: 'joao@example.com' })
  email: string;

  @ApiProperty({ description: 'Phone number (10 or 11 digits)', example: '11987654321' })
  phone: string;

  @ApiProperty({ description: 'Record creation timestamp', format: 'date-time' })
  createdAt?: Date;

  @ApiProperty({ description: 'Record last update timestamp', format: 'date-time' })
  updatedAt?: Date;
}
