import { ClassType, Field, Int, ObjectType } from "type-graphql";

export function paginatedResponse<TItemsFieldValue>(
  itemsFieldValue: ClassType<TItemsFieldValue> | String | Number | Boolean,
) {
  // `isAbstract` decorator option is mandatory to prevent registering in schema
  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponseClass {
    @Field(() => [itemsFieldValue])
    items: TItemsFieldValue[];

    @Field(() => Int)
    total: number;

    @Field()
    hasMore: boolean;
  }
  return PaginatedResponseClass;
}
