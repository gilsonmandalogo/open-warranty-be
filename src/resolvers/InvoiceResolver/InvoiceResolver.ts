import { ErrorInvoiceNotFound } from 'errors';
import { createWriteStream, rm } from 'fs';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { CreateInvoiceInput, Invoice, InvoiceAllResult, InvoicePaginated, UpdateInvoiceInput } from 'models/Invoice';
import { parse, resolve } from 'path';
import { Arg, Int, Mutation, Query, Resolver } from 'type-graphql';

const calculateExpDateAndProgress = (item: Invoice) => {
  if (!item.purchase || !item.duration) {
    return {
      expDate: null,
      progress: null,
    };
  }

  const expDate = new Date(item.purchase);
  const now = new Date();
  expDate.setUTCMonth(expDate.getUTCMonth() + item.duration);
  // @ts-ignore
  const progress = (now - item.purchase) / (expDate - item.purchase);
  return {expDate, progress};
}

@Resolver()
export class InvoiceResolver {
  @Query( /* istanbul ignore next */ () => Invoice)
  invoice(@Arg('id') id: string) {
    return Invoice.findOne(id);
  }

  @Query( /* istanbul ignore next */ () => InvoicePaginated)
  async invoiceAll(@Arg("skip", /* istanbul ignore next */ () => Int, { nullable: true }) skip?: number) {
    const [itemsDb, total] = await Invoice.findAndCount({
      skip,
      take: 10,
    });

    const items = itemsDb.map(item => {
      const { expDate, progress } = calculateExpDateAndProgress(item);
      return {
        ...item,
        expDate,
        progress,
      } as InvoiceAllResult;
    });

    return {
      items,
      total,
      hasMore: skip ? (skip + items.length) < total : items.length < total,
    } as InvoicePaginated;
  }

  @Mutation( /* istanbul ignore next */ () => Invoice)
  async createInvoice(@Arg('data') data: CreateInvoiceInput) {
    const invoice = Invoice.create(data);
    await Invoice.save(invoice);
    return invoice;
  }

  @Mutation( /* istanbul ignore next */ () => Invoice)
  async updateInvoice(@Arg('id') id: string, @Arg('data') data: UpdateInvoiceInput) {
    const invoice = await Invoice.findOne(id);
    if (!invoice) {
      throw new ErrorInvoiceNotFound();
    }
    Object.assign(invoice, data);
    await Invoice.save(invoice);
    return invoice;
  }

  @Mutation( /* istanbul ignore next */ () => Boolean)
  async deleteInvoice(@Arg('id') id: string) {
    const invoice = await Invoice.findOne(id);
    if (!invoice) {
      throw new ErrorInvoiceNotFound();
    }
    await Invoice.remove(invoice);
    const diskFileName = resolve(`./public/images/${parse(invoice.photo).base}`);
    await new Promise(resolve => rm(diskFileName, resolve));
    return true;
  }

  @Mutation( /* istanbul ignore next */ () => String)
  async upload(@Arg('file', /* istanbul ignore next */ () => GraphQLUpload) file: FileUpload) {
    const ext = parse(file.filename).ext;
    const diskFileName = resolve(`./public/images/${Date.now()}${ext}`);
    const diskFileStream = createWriteStream(diskFileName);
    return await new Promise<string>((resolve, reject) => {
      file.createReadStream().pipe(diskFileStream)
        .on('finish', () => {
          resolve(`/images/${parse(diskFileName).base}`);
        })
        .on('error', reject);
    });
  }
}
