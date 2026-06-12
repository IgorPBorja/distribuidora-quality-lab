import { Injectable, Inject } from '@nestjs/common';
import {
  CustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../../domain/repositories/customer.repository';
import { NotFoundException } from '@shared/domain/exceptions';
import { LoggerService } from '@shared/infrastructure/logging/logger.service';

export interface GetCustomerOutput {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(id: string): Promise<GetCustomerOutput> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      this.logger.warn(
        'Customer retrieval failed: customer not found', 'GetCustomerUseCase', { customerId: id }
      );
      throw new NotFoundException('Customer not found', { customerId: id });
    }

    return {
      id: customer.id,
      name: customer.name,
      document: customer.document,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
