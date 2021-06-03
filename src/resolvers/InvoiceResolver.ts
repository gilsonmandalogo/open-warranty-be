import { host } from 'consts';
import { createWriteStream } from 'fs';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { Invoice } from 'models/Invoice';
import { parse, resolve } from 'path';
import { Arg, Field, InputType, Int, Mutation, Query, Resolver } from 'type-graphql';

@InputType()
export class CreateInvoiceInput implements Partial<Invoice> {
  @Field()
  photo: string;

  @Field()
  item: string;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field({ nullable: true })
  purchase?: Date;
}

@InputType()
export class UpdateInvoiceInput implements Partial<Invoice> {
  @Field({ nullable: true })
  photo?: string;

  @Field({ nullable: true })
  item?: string;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field({ nullable: true })
  purchase?: Date;
}

@Resolver()
export class InvoiceResolver {
  @Query(() => Invoice)
  invoice(@Arg('id') id: string) {
    return Invoice.findOne(id);
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
