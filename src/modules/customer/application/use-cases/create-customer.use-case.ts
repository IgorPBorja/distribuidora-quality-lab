import { Injectable, Inject } from '@nestjs/common';
import { CustomerEntity } from '../../domain/entities/customer.entity';
import {
  CustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../../domain/repositories/customer.repository';
import { ValidateDocumentUseCase } from '../../domain/validate-document.use-case';
import { ConflictException } from '@shared/domain/exceptions';
import { LoggerService } from '@shared/infrastructure/logging/logger.service';

export interface CreateCustomerInput {
  name: string;
  document: string;
  email: string;
  phone: string;
}

export interface CreateCustomerOutput {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  createdAt: Date;
}

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    private readonly validateDocumentUseCase: ValidateDocumentUseCase,
    private readonly logger: LoggerService,
  ) {}

  async execute(input: CreateCustomerInput): Promise<CreateCustomerOutput> {
    this.logger.log('Customer creation started', 'CreateCustomerUseCase', { email: input.email });
    this.validateDocumentUseCase.execute({ document: input.document });

    const existingCustomer = await this.customerRepository.findByEmail(input.email);

    if (existingCustomer) {
      this.logger.warn('Customer creation failed: email already in use', 'CreateCustomerUseCase', { email: input.email });
      throw new ConflictException('Email already in use', {
        email: input.email,
      });
    }

    const customer = CustomerEntity.create({
      name: input.name,
      document: input.document,
      email: input.email,
      phone: input.phone,
    });

    const saved = await this.customerRepository.save(customer);

    this.logger.log('Customer creation successful', 'CreateCustomerUseCase', { customerId: saved.id });

    return {
      id: saved.id,
      name: saved.name,
      document: saved.document,
      email: saved.email,
      phone: saved.phone,
      createdAt: saved.createdAt,
    };
  }
}
