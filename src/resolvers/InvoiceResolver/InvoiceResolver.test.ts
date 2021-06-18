import { ErrorInvoiceNotFound } from 'errors';
import { createReadStream, rm } from 'fs';
import { CreateInvoiceInput } from "models/Invoice";
import { resolve } from 'path';
import { InvoiceResolver } from "./InvoiceResolver";

describe('InvoiceResolver', () => {
  const invoiceResolver = new InvoiceResolver();

  test('createInvoice with required data', async () => {
    const data = {
      item: 'Test item',
      photo: '/photo.png',
    } as CreateInvoiceInput;

    const newInvoice = await invoiceResolver.createInvoice(data);

    expect(newInvoice).toMatchObject({
      ...data,
      id: 1,
    });
  });

  test('createInvoice with all data', async () => {
    const data = {
      item: 'Test item',
      photo: '/photo.png',
      duration: 24,
      purchase: new Date('2021-06-18T14:52:38.323Z'),
    } as CreateInvoiceInput;

    const newInvoice = await invoiceResolver.createInvoice(data);

    expect(newInvoice).toMatchObject({
      ...data,
      id: 1,
    });
  });

  test('invoice query', async () => {
    const data = {
      item: 'Test item',
      photo: '/photo.png',
    } as CreateInvoiceInput;

    await invoiceResolver.createInvoice(data);
    const invoice = await invoiceResolver.invoice('1');

    expect(invoice).toMatchObject({
      ...data,
      id: 1,
    });
  });

  test('invoiceAll query', async () => {
    const data1 = {
      item: 'Test item 1',
      photo: '/photo-1.png',
    } as CreateInvoiceInput;

    const data2 = {
      item: 'Test item 2',
      photo: '/photo-2.png',
      duration: 12,
      purchase: new Date('2021-06-18T14:52:38.323Z'),
    } as CreateInvoiceInput;

    await invoiceResolver.createInvoice(data1);
    await invoiceResolver.createInvoice(data2);
    const invoicePaginated = await invoiceResolver.invoiceAll();

    expect(invoicePaginated).toMatchObject({
      hasMore: false,
      total: 2,
      items: [data1, data2],
    });
  });

  test('invoiceAll query with skip', async () => {
    const data1 = {
      item: 'Test item 1',
      photo: '/photo-1.png',
    } as CreateInvoiceInput;

    const data2 = {
      item: 'Test item 2',
      photo: '/photo-2.png',
    } as CreateInvoiceInput;

    await invoiceResolver.createInvoice(data1);
    await invoiceResolver.createInvoice(data2);
    const invoicePaginated = await invoiceResolver.invoiceAll(1);

    expect(invoicePaginated).toMatchObject({
      hasMore: false,
      total: 2,
      items: [data2],
    });
  });

  test('updateInvoice', async () => {
    const data = {
      item: 'Test item before',
      photo: '/photo.png',
    } as CreateInvoiceInput;

    await invoiceResolver.createInvoice(data);
    await invoiceResolver.updateInvoice('1', { item: 'Test item after' });
    const invoice = await invoiceResolver.invoice('1');

    expect(invoice).toMatchObject({
      ...data,
      id: 1,
      item: 'Test item after',
    });
  });

  test('updateInvoice with invalid id', async () => {
    await expect(() => invoiceResolver.updateInvoice('1', { item: 'Test item after' }))
      .rejects
      .toThrow(ErrorInvoiceNotFound);
  });

  test('deleteInvoice', async () => {
    const data = {
      item: 'Test item',
      photo: '/photo.png',
    } as CreateInvoiceInput;

    await invoiceResolver.createInvoice(data);
    await invoiceResolver.deleteInvoice('1');
    const invoice = await invoiceResolver.invoice('1');

    expect(invoice).toBeUndefined();
  });

  test('deleteInvoice with invalid id', async () => {
    await expect(() => invoiceResolver.deleteInvoice('1'))
      .rejects
      .toThrow(ErrorInvoiceNotFound);
  });

  test('upload', async () => {
    const buildStream = () => createReadStream(resolve('./src/resolvers/InvoiceResolver/test-image.jpg'));
    const mockDate = new Date('2021-06-18T14:52:38.323Z').getTime();
    jest
      .spyOn(Date, 'now')
      .mockImplementation(() => mockDate)

    try {
      const result = await invoiceResolver.upload({
        filename: 'test-image.jpg',
        mimetype: '',
        encoding: '',
        createReadStream: buildStream,
      });
  
      expect(result).toBe(`/images/${mockDate}.jpg`);
    } finally {
      await new Promise(resolvePromise => {
        rm(resolve(`./public/images/${mockDate}.jpg`), resolvePromise);
      });
    }
  });
});
