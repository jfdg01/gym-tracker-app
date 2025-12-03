import { ProgramRepository, NewProgram } from "../repositories/ProgramRepository";
import { DayRepository, NewDay } from "../repositories/DayRepository";

export class ProgramService {
    constructor(
        private programRepository: ProgramRepository,
        private dayRepository: DayRepository
    ) { }

    async getAllPrograms() {
        return await this.programRepository.getAll();
    }

    async getProgramById(id: number) {
        return await this.programRepository.getById(id);
    }

    async createProgram(program: NewProgram) {
        return await this.programRepository.create(program);
    }

    async updateProgram(id: number, program: Partial<NewProgram>) {
        return await this.programRepository.update(id, program);
    }

    async deleteProgram(id: number) {
        return await this.programRepository.delete(id);
    }

    async getDaysByProgramId(programId: number) {
        return await this.dayRepository.getByProgramId(programId);
    }

    async createDay(day: NewDay) {
        return await this.dayRepository.create(day);
    }

    async updateDay(id: number, day: Partial<NewDay>) {
        return await this.dayRepository.update(id, day);
    }

    async deleteDay(id: number) {
        return await this.dayRepository.delete(id);
    }
}
