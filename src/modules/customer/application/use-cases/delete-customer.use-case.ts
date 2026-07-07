import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  CustomerRepository,
  CUSTOMER_REPOSITORY,
} from '../../domain/repositories/customer.repository';
import { NotFoundException } from '@shared/domain/exceptions';

@Injectable()
export class DeleteCustomerUseCase {
  private readonly logger = new Logger(DeleteCustomerUseCase.name);

  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundException('Customer not found', { customerId: id });
    }

    await this.customerRepository.delete(id);

    this.logger.log({ event: 'customer_deleted', customerId: id });
  }
}
