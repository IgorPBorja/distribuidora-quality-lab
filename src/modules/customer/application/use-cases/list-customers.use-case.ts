import { Injectable, Inject } from '@nestjs/common';
import {
  CustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../../domain/repositories/customer.repository';
import { LoggerService } from '@shared/infrastructure/logging/logger.service';

export interface CustomerListItem {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ListCustomersUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(): Promise<CustomerListItem[]> {
    const customers = await this.customerRepository.findAll();

    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      document: customer.document,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }));
  }
}
