import { and, eq } from 'drizzle-orm';

import { type IRepository } from '~/libs/interfaces/repository.interface.js';
import { type IDatabase } from '~/libs/packages/database/libs/interfaces/database.interface.js';
import { type DatabaseSchema } from '~/libs/packages/database/schema/schema.js';

import { type ShiftDatabaseModel } from './libs/types/types.js';
import { type ShiftEntity as ShiftEntityT } from './shift.js';

class ShiftRepository implements IRepository {
  private db: Pick<IDatabase, 'driver'>;

  private shiftSchema: DatabaseSchema['shifts'];

  public constructor(
    database: Pick<IDatabase, 'driver'>,
    shiftSchema: DatabaseSchema['shifts'],
  ) {
    this.db = database;
    this.shiftSchema = shiftSchema;
  }

  public find(
    partial: Partial<ShiftDatabaseModel>,
  ): ReturnType<IRepository<ShiftDatabaseModel>['find']> {
    const queries = Object.entries(partial).map(([key, value]) =>
      eq(
        this.shiftSchema[key as keyof typeof partial],
        value as NonNullable<typeof value>,
      ),
    );

    const finalQuery = queries.length === 1 ? queries[0] : and(...queries);

    return this.db
      .driver()
      .query.shifts.findMany({
        where: finalQuery,
      })
      .execute();
  }

  // public async checkExists({
  //   id,
  //   taxNumber,
  //   companyName,
  //   ownerId,
  // }: Partial<BusinessEntityT>): Promise<OperationResult<boolean>> {
  //   const filterClause: SQL[] = [];

  //   if (id) {
  //     filterClause.push(eq(this.businessSchema.id, id));
  //   }

  //   if (taxNumber) {
  //     filterClause.push(eq(this.businessSchema.taxNumber, taxNumber));
  //   }

  //   if (companyName) {
  //     filterClause.push(eq(this.businessSchema.companyName, companyName));
  //   }

  //   if (ownerId) {
  //     filterClause.push(eq(this.businessSchema.ownerId, ownerId));
  //   }

  //   if (filterClause.length === 0) {
  //     throw new ApplicationError({
  //       message: AppErrorMessage.INVALID_QUERY,
  //     });
  //   }

  //   const [business]: BusinessEntityT[] = await this.db
  //     .driver()
  //     .select()
  //     .from(this.businessSchema)
  //     .where(or(...filterClause));

  //   return {
  //     result: Boolean(business),
  //   };
  // }

  public async create(
    entity: Pick<ShiftEntityT, 'startDate' | 'truckId' | 'driverUserId'>,
  ): ReturnType<IRepository<ShiftDatabaseModel>['create']> {
    const [shift] = await this.db
      .driver()
      .insert(this.shiftSchema)
      .values(entity)
      .returning()
      .execute();

    return shift;
  }

  public async findById(
    id: ShiftEntityT['id'],
  ): Promise<ShiftDatabaseModel | null> {
    const [shift] = await this.db
      .driver()
      .select()
      .from(this.shiftSchema)
      .where(eq(this.shiftSchema.id, id))
      .execute();

    return shift;
  }

  public async update({
    id,
    payload,
  }: {
    id: number;
    payload: Partial<ShiftDatabaseModel>;
  }): Promise<ShiftDatabaseModel> {
    const [item] = await this.db
      .driver()
      .update(this.shiftSchema)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(this.shiftSchema.id, id))
      .returning()
      .execute();

    return item;
  }

  public async delete(id: number): Promise<boolean> {
    const [item] = await this.db
      .driver()
      .delete(this.shiftSchema)
      .where(eq(this.shiftSchema.id, id))
      .returning()
      .execute();

    return await Promise.resolve(Boolean(item));
  }
}

export { ShiftRepository };
