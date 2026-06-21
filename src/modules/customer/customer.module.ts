import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidateDocumentUseCase } from './domain/validate-document.use-case';
import { CreateCustomerUseCase } from './application/use-cases/create-customer.use-case';
import { ListCustomersUseCase } from './application/use-cases/list-customers.use-case';
import { GetCustomerUseCase } from './application/use-cases/get-customer.use-case';
import { UpdateCustomerUseCase } from './application/use-cases/update-customer.use-case';
import { DeleteCustomerUseCase } from './application/use-cases/delete-customer.use-case';
import { TypeOrmCustomerRepository } from './infrastructure/persistence/typeorm-customer.repository';
import { CustomerController } from './interface/controllers/customer.controller';
import { CUSTOMER_REPOSITORY } from './domain/repositories/customer.repository';
import { TypeOrmCustomerEntity } from './infrastructure/persistence/typeorm-customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmCustomerEntity])],
  controllers: [CustomerController],
  providers: [
    ValidateDocumentUseCase,
    CreateCustomerUseCase,
    ListCustomersUseCase,
    GetCustomerUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: TypeOrmCustomerRepository,
    },
  ],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomerModule {}
