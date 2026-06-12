import { Injectable, Inject } from '@nestjs/common';
import {
  CustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../../domain/repositories/customer.repository';
import { NotFoundException, ConflictException } from '@shared/domain/exceptions';
import { LoggerService } from '@shared/infrastructure/logging/logger.service';

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UpdateCustomerOutput {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  updatedAt: Date;
}

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(id: string, input: UpdateCustomerInput): Promise<UpdateCustomerOutput> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      this.logger.warn(
        'Customer update failed: customer not found', 'UpdateCustomerUseCase', { customerId: id }
      );
      throw new NotFoundException('Customer not found', { customerId: id });
    }

    if (input.email !== undefined && input.email !== customer.email) {
      const existingCustomer = await this.customerRepository.findByEmail(input.email);

      if (existingCustomer) {
        this.logger.warn(
          'Customer update failed: email already in use', 'UpdateCustomerUseCase', { email: input.email }
        );
        throw new ConflictException('Email already in use', {
          email: input.email,
        });
      }
    }

    customer.update({
      name: input.name,
      email: input.email,
      phone: input.phone,
    });

    const saved = await this.customerRepository.save(customer);

    return {
      id: saved.id,
      name: saved.name,
      document: saved.document,
      email: saved.email,
      phone: saved.phone,
      updatedAt: saved.updatedAt,
    };
  }
}
