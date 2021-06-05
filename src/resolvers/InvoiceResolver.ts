import { host } from 'consts';
import { createWriteStream } from 'fs';
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
  @Query(() => Invoice)
  invoice(@Arg('id') id: string) {
    return Invoice.findOne(id);
  }

  @Query(() => InvoicePaginated)
  async invoiceAll(@Arg("skip", () => Int, { nullable: true }) skip?: number) {
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

  @Mutation(() => Invoice)
  async createInvoice(@Arg('data') data: CreateInvoiceInput) {
    const invoice = Invoice.create(data);
    await Invoice.save(invoice);
    return invoice;
  }

  @Mutation(() => Invoice)
  async updateInvoice(@Arg('id') id: string, @Arg('data') data: UpdateInvoiceInput) {
    const invoice = await Invoice.findOne(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    Object.assign(invoice, data);
    await Invoice.save(invoice);
    return invoice;
  }

  @Mutation(() => Boolean)
  async deleteInvoice(@Arg('id') id: string) {
    const invoice = await Invoice.findOne(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    await Invoice.remove(invoice);
    return true;
  }

  @Mutation(() => String)
  async upload(@Arg('file', () => GraphQLUpload) file: FileUpload) {
    const ext = parse(file.filename).ext;
    const diskFileName = resolve(`./public/images/${Date.now()}${ext}`);
    const diskFileStream = createWriteStream(diskFileName);
    return await new Promise<string>((resolve, reject) => {
      file.createReadStream().pipe(diskFileStream)
        .on('finish', () => {
          resolve(`${host}/images/${parse(diskFileName).base}`);
        })
        .on('error', reject);
    });
  }
}
