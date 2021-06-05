import { paginatedResponse } from 'paginatedResponse';
import { Field, ID, InputType, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Invoice extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field()
  @Column()
  photo: string;

  @Field()
  @Column()
  item: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  duration?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  purchase?: Date;
}

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

@ObjectType()
export class InvoiceAllResult extends Invoice {
  @Field({ nullable: true })
  expDate?: Date;

  @Field({ nullable: true })
  progress?: number;
}

@ObjectType()
export class InvoicePaginated extends paginatedResponse(InvoiceAllResult) {}
