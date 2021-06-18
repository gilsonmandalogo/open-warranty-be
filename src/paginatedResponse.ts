import { ClassType, Field, Int, ObjectType } from "type-graphql";

export function paginatedResponse<TItemsFieldValue>(
  itemsFieldValue: ClassType<TItemsFieldValue> | String | Number | Boolean,
) {
  // `isAbstract` decorator option is mandatory to prevent registering in schema
  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponseClass {
    @Field( /* istanbul ignore next */ () => [itemsFieldValue])
    items: TItemsFieldValue[];

    @Field( /* istanbul ignore next */ () => Int)
    total: number;

    @Field()
    hasMore: boolean;
  }
  return PaginatedResponseClass;
}
