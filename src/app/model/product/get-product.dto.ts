import { ApiProperty } from '@nestjs/swagger';

export class GetProductDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    imageUrl: string;
}
