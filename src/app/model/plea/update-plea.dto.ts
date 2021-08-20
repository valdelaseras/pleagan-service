import { ApiProperty } from '@nestjs/swagger';

export class UpdatePleaDto {
    @ApiProperty()
    description: string;
}
