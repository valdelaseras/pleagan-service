import { NotificationSettingsDto } from './notification-settings.dto';
import { THEME } from './theme.enum';

export class UserSettingsDto {
  email: NotificationSettingsDto;
  countryPrivate: boolean;
  theme: THEME;
}
