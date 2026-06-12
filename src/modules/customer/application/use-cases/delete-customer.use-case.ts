import { Injectable, Inject } from '@nestjs/common';
import {
  CustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../../domain/repositories/customer.repository';
import { NotFoundException } from '@shared/domain/exceptions';
import { LoggerService } from '@shared/infrastructure/logging/logger.service';

@Injectable()
export class DeleteCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(id: string): Promise<void> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      this.logger.warn(
        'Customer deletion failed: customer not found', 'DeleteCustomerUseCase', { customerId: id }
      );
      throw new NotFoundException('Customer not found', { customerId: id });
    }

    await this.customerRepository.delete(id);
  }
}
