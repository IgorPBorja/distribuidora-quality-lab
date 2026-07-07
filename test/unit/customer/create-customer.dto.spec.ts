import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCustomerDto } from '@modules/customer/interface/dtos/create-customer.dto';

const validBase = {
  name: 'João Silva',
  document: '52998224725',
  email: 'joao@example.com',
  phone: '11987654321',
};

async function validateDto(data: object) {
  const dto = plainToInstance(CreateCustomerDto, data);
  return validate(dto);
}

describe('CreateCustomerDto', () => {
  describe('document field', () => {
    it('accepts a valid 11-digit CPF', async () => {
      const errors = await validateDto({ ...validBase, document: '52998224725' });
      expect(errors.filter((e) => e.property === 'document')).toHaveLength(0);
    });

    it('accepts a valid 14-digit CNPJ', async () => {
      const errors = await validateDto({ ...validBase, document: '11222333000181' });
      expect(errors.filter((e) => e.property === 'document')).toHaveLength(0);
    });

    it('rejects document with fewer than 11 digits', async () => {
      const errors = await validateDto({ ...validBase, document: '1234567890' });
      expect(errors.some((e) => e.property === 'document')).toBe(true);
    });

    it('rejects document with 12 digits (between CPF and CNPJ length)', async () => {
      const errors = await validateDto({ ...validBase, document: '123456789012' });
      expect(errors.some((e) => e.property === 'document')).toBe(true);
    });

    it('rejects document with letters', async () => {
      const errors = await validateDto({ ...validBase, document: 'abc12345678' });
      expect(errors.some((e) => e.property === 'document')).toBe(true);
    });

    it('rejects document with special characters', async () => {
      const errors = await validateDto({ ...validBase, document: '529.982.247-25' });
      expect(errors.some((e) => e.property === 'document')).toBe(true);
    });
  });

  describe('phone field', () => {
    it('accepts a valid 10-digit phone', async () => {
      const errors = await validateDto({ ...validBase, phone: '1198765432' });
      expect(errors.filter((e) => e.property === 'phone')).toHaveLength(0);
    });

    it('accepts a valid 11-digit phone', async () => {
      const errors = await validateDto({ ...validBase, phone: '11987654321' });
      expect(errors.filter((e) => e.property === 'phone')).toHaveLength(0);
    });

    it('rejects phone with fewer than 10 digits', async () => {
      const errors = await validateDto({ ...validBase, phone: '119876543' });
      expect(errors.some((e) => e.property === 'phone')).toBe(true);
    });

    it('rejects phone with more than 11 digits', async () => {
      const errors = await validateDto({ ...validBase, phone: '119876543210' });
      expect(errors.some((e) => e.property === 'phone')).toBe(true);
    });

    it('rejects phone containing letters', async () => {
      const errors = await validateDto({ ...validBase, phone: '1198765432a' });
      expect(errors.some((e) => e.property === 'phone')).toBe(true);
    });

    it('rejects phone with formatting characters', async () => {
      const errors = await validateDto({ ...validBase, phone: '(11)98765-4321' });
      expect(errors.some((e) => e.property === 'phone')).toBe(true);
    });
  });
});
