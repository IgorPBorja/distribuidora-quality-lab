import { CustomerEntity } from '@modules/customer/domain/entities/customer.entity';
import { TypeOrmCustomerEntity } from '@modules/customer/infrastructure/persistence/typeorm-customer.entity';

describe('TypeOrmCustomerEntity', () => {
  const fixedId = 'b1c2d3e4-f5a6-7890-abcd-ef1234567890';

  const domainCustomer = new CustomerEntity(
    fixedId,
    'João Silva',
    '52998224725',
    'joao@example.com',
    '11987654321',
  );

  describe('fromDomainEntity', () => {
    it('maps all core fields from domain entity', () => {
      const ormEntity = TypeOrmCustomerEntity.fromDomainEntity(domainCustomer);

      expect(ormEntity.id).toBe(fixedId);
      expect(ormEntity.name).toBe('João Silva');
      expect(ormEntity.document).toBe('52998224725');
      expect(ormEntity.email).toBe('joao@example.com');
      expect(ormEntity.phone).toBe('11987654321');
    });

    it('does not set timestamps — TypeORM manages those on persist', () => {
      const ormEntity = TypeOrmCustomerEntity.fromDomainEntity(domainCustomer);

      expect(ormEntity.createdAt).toBeUndefined();
      expect(ormEntity.updatedAt).toBeUndefined();
    });
  });

  describe('toDomainEntity', () => {
    it('maps all core fields back to a CustomerEntity', () => {
      const ormEntity = TypeOrmCustomerEntity.fromDomainEntity(domainCustomer);

      const result = ormEntity.toDomainEntity();

      expect(result).toBeInstanceOf(CustomerEntity);
      expect(result.id).toBe(fixedId);
      expect(result.name).toBe('João Silva');
      expect(result.document).toBe('52998224725');
      expect(result.email).toBe('joao@example.com');
      expect(result.phone).toBe('11987654321');
    });

    it('propagates createdAt and updatedAt populated by TypeORM after persist', () => {
      const ormEntity = TypeOrmCustomerEntity.fromDomainEntity(domainCustomer);
      const createdAt = new Date('2024-01-15T10:00:00.000Z');
      const updatedAt = new Date('2024-06-01T14:30:00.000Z');

      // Simulate what TypeORM does after writing to the database
      (ormEntity as any)._createdAt = createdAt;
      (ormEntity as any)._updatedAt = updatedAt;

      const result = ormEntity.toDomainEntity();

      expect(result.createdAt).toEqual(createdAt);
      expect(result.updatedAt).toEqual(updatedAt);
    });

    it('returns undefined timestamps when TypeORM has not populated them yet', () => {
      const ormEntity = TypeOrmCustomerEntity.fromDomainEntity(domainCustomer);

      const result = ormEntity.toDomainEntity();

      expect(result.createdAt).toBeUndefined();
      expect(result.updatedAt).toBeUndefined();
    });
  });

  describe('round-trip: fromDomainEntity → toDomainEntity', () => {
    it('preserves all core fields through the mapping boundary', () => {
      const result = TypeOrmCustomerEntity
        .fromDomainEntity(domainCustomer)
        .toDomainEntity();

      expect(result.id).toBe(domainCustomer.id);
      expect(result.name).toBe(domainCustomer.name);
      expect(result.document).toBe(domainCustomer.document);
      expect(result.email).toBe(domainCustomer.email);
      expect(result.phone).toBe(domainCustomer.phone);
    });
  });
});
