import { Entity as DomainEntity } from '@shared/domain/entity';
import { ValidationException } from '@shared/domain/exceptions/validation.exception';
import { Document } from '../value-objects/document.vo';
import { randomUUID } from 'crypto';

interface CreateCustomerProps {
  name: string;
  document: string;
  email: string;
  phone: string;
}

interface UpdateCustomerProps {
  name?: string;
  email?: string;
  phone?: string;
}

export class CustomerEntity extends DomainEntity {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    id: string,
    name: string,
    document: string,
    email: string,
    phone: string,
    createdAt?: Date,
    updatedAt?: Date,
  ){
    super();
    this.id = id;
    this.name = name;
    this.document = document;
    this.email = email;
    this.phone = phone;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(props: CreateCustomerProps): CustomerEntity {
    CustomerEntity.validateName(props.name);
    CustomerEntity.validateEmail(props.email);
    CustomerEntity.validatePhone(props.phone);

    const documentVo = Document.create(props.document);
    const formattedPhone = props.phone.replace(/\D/g, '');

    const customer = new CustomerEntity(
      randomUUID(),
      props.name,
      documentVo.value,
      props.email,
      formattedPhone,
    );
    return customer;
  }

  update(props: UpdateCustomerProps): void {
    if (props.name !== undefined) {
      CustomerEntity.validateName(props.name);
      this.name = props.name;
    }

    if (props.email !== undefined) {
      CustomerEntity.validateEmail(props.email);
      this.email = props.email;
    }

    if (props.phone !== undefined) {
      CustomerEntity.validatePhone(props.phone);
      this.phone = props.phone.replace(/\D/g, '');
    }
  }

  private static validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationException('Name is required', {
        field: 'name',
        constraint: 'Name must be between 1 and 150 characters',
      });
    }

    if (name.length > 150) {
      throw new ValidationException('Name exceeds maximum length', {
        field: 'name',
        constraint: 'Name must be between 1 and 150 characters',
        received: name.length,
      });
    }
  }

  private static validateEmail(email: string): void {
    if (!email || !email.includes('@')) {
      throw new ValidationException('Invalid email format', {
        field: 'email',
        constraint: 'Email must contain @ and a domain',
      });
    }

    if (email.length > 254) {
      throw new ValidationException('Email exceeds maximum length', {
        field: 'email',
        constraint: 'Email must be at most 254 characters',
        received: email.length,
      });
    }

    const parts = email.split('@');
    if (parts.length !== 2 || !parts[1] || !parts[1].includes('.')) {
      throw new ValidationException('Invalid email format', {
        field: 'email',
        constraint: 'Email must contain @ and a valid domain',
      });
    }
  }

  private static validatePhone(phone: string): void {
    if (!phone) {
      throw new ValidationException('Invalid phone number format', {
        field: 'phone',
        constraint: 'Phone number cannot be empty',
      });
    }

    const digits = phone.replace(/\D/g, '');

    if (digits.length < 10 || digits.length > 11) {
      throw new ValidationException('Invalid phone number', {
        field: 'phone',
        constraint: 'Phone must have 10 or 11 digits',
        received: digits.length,
      });
    }
  }
}
