import { UserRepository } from "../repositories/UserRepository";
import { user_settings } from "../db/schema";
import { InferInsertModel } from "drizzle-orm";

type NewUserSettings = InferInsertModel<typeof user_settings>;

export class UserService {
    constructor(private userRepository: UserRepository) { }

    async getUserSettings() {
        await this.userRepository.ensureSettingsExist();
        return await this.userRepository.getSettings();
    }

    async updateUserSettings(settings: Partial<NewUserSettings>) {
        await this.userRepository.ensureSettingsExist();
        return await this.userRepository.updateSettings(settings);
    }
}
