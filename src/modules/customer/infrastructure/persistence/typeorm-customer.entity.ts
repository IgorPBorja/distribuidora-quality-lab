import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Entity as PersistenceEntity } from '@shared/domain/entity';
import { CustomerEntity } from '@modules/customer/domain/entities/customer.entity';

@Entity('customers')
export class TypeOrmCustomerEntity extends PersistenceEntity {
  @PrimaryColumn({ name: 'id' })
  private _id: string;

  @Column({ length: 150, name: 'name' })
  private _name: string;

  @Column({ length: 14, name: 'document' })
  private _document: string;

  @Column({ length: 254, unique: true, name: 'email' })
  private _email: string;

  @Column({ length: 11, name: 'phone' })
  private _phone: string;

  @CreateDateColumn({ name: 'created_at' })
  private _createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  private _updatedAt: Date;

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get document(): string {
    return this._document;
  }

  get email(): string {
    return this._email;
  }

  get phone(): string {
    return this._phone;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static fromDomainEntity(customer: CustomerEntity): TypeOrmCustomerEntity {
    const persistenceEntity = new TypeOrmCustomerEntity();

    persistenceEntity._id = customer.id;
    persistenceEntity._name = customer.name;
    persistenceEntity._document = customer.document;
    persistenceEntity._email = customer.email;
    persistenceEntity._phone = customer.phone;

    return persistenceEntity;
  }

  toDomainEntity(): CustomerEntity {
    return new CustomerEntity(
        this.id,
        this.name,
        this.document,
        this.email,
        this.phone,
    );
  }
}
