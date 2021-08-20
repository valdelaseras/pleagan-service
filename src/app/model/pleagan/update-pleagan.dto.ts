import { UserSettingsDto } from './user-settings.dto';

export class UpdatePleaganDto {
    displayName: string;
    photoUrl: string;
    country: string;
    settings: UserSettingsDto;
}
