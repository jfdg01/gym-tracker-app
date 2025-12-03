import { UserRepository, NewUserSettings } from "../repositories/UserRepository";

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
