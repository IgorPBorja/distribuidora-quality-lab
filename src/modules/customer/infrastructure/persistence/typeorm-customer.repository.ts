import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepo } from 'typeorm';
import { CustomerRepository } from '../../domain/repositories/customer.repository';
import { CustomerEntity } from '../../domain/entities/customer.entity';
import { TypeOrmCustomerEntity } from './typeorm-customer.entity';

@Injectable()
export class TypeOrmCustomerRepository implements CustomerRepository {
  constructor(
    @InjectRepository(TypeOrmCustomerEntity)
    private readonly ormRepository: TypeOrmRepo<TypeOrmCustomerEntity>,
  ) {}

  async findById(id: string): Promise<CustomerEntity | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.ormRepository.findOneBy({ _id: id } as any)
      .then(customer => customer?.toDomainEntity() ?? null);
  }

  async findByEmail(email: string): Promise<CustomerEntity | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.ormRepository.findOneBy({ _email: email } as any)
      .then(customer => customer?.toDomainEntity() ?? null);
  }

  async findAll(): Promise<CustomerEntity[]> {
    return this.ormRepository.find()
      .then(customers => customers.map(customer => customer.toDomainEntity()));
  }

  async save(customer: CustomerEntity): Promise<CustomerEntity> {
    return this.ormRepository.save(TypeOrmCustomerEntity.fromDomainEntity(customer))
      .then(customer => customer.toDomainEntity());
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
