import { BaseRepository } from "./BaseRepository";
import { days } from "../db/schema";
import { InferInsertModel, eq } from "drizzle-orm";

export type NewDay = InferInsertModel<typeof days>;

export class DayRepository extends BaseRepository<typeof days> {
    constructor() {
        super(days);
    }

    async create(day: NewDay) {
        const result = await this.db.insert(days).values(day).returning();
        return result[0];
    }

    async update(id: number, day: Partial<NewDay>) {
        const result = await this.db.update(days)
            .set(day)
            .where(eq(days.id, id))
            .returning();
        return result[0];
    }

    async getByProgramId(programId: number) {
        return await this.db.select().from(days).where(eq(days.program_id, programId));
    }
}
