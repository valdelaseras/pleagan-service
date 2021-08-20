import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {

    @ApiProperty({
        example: 'Simple sense.',
        description: 'The name of the company.',
        type: String
    })
    name: string;
}
