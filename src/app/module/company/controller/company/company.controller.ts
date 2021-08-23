import { Controller, Get } from '@nestjs/common';
import { CompanyService } from '../../service/company/company.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Company, GetCompanyDto } from '../../../../model';

@ApiTags( 'company' )
@Controller('company')
export class CompanyController {
    constructor( private companyService: CompanyService ) {}

    @ApiOperation({ summary: 'Get a list of all registered companies.' })
    @ApiResponse({
        status: 200,
        description: 'Success.',
        isArray: true,
        type: () => GetCompanyDto
    })
    @Get('all')
    getAllCompanies(): Promise<Company[]> {
        return this.companyService.getAllCompanies()
    }

    @ApiOperation({ summary: 'Get a list of all registered companies\' names.' })
    @ApiResponse({
        status: 200,
        description: 'Success.',
        isArray: true,
        type: String
    })
    @Get('all/names-only')
    getAllCompanyNames(): Promise<string[]> {
        return this.companyService.getKnownCompanies()
    }
}
