import { ApiProperty } from '@nestjs/swagger';

export class UpdateSupportDto {
    @ApiProperty()
    comment: string;
}
