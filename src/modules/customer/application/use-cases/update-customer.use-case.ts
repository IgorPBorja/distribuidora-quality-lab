import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  CustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../../domain/repositories/customer.repository';
import { NotFoundException, ConflictException } from '@shared/domain/exceptions';

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
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class UpdateCustomerUseCase {
  private readonly logger = new Logger(UpdateCustomerUseCase.name);

  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(id: string, input: UpdateCustomerInput): Promise<UpdateCustomerOutput> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundException('Customer not found', { customerId: id });
    }

    if (input.email !== undefined && input.email !== customer.email) {
      const existingCustomer = await this.customerRepository.findByEmail(input.email);

      if (existingCustomer) {
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

    this.logger.log({ event: 'customer_updated', customerId: id });

    return {
      id: saved.id,
      name: saved.name,
      document: saved.document,
      email: saved.email,
      phone: saved.phone,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
