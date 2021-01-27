import { Controller, Get, Query } from '@nestjs/common';
import { CompanyService } from '../../service/company/company.service';
import { Company } from '../../model/company/base';

@Controller('company')
export class CompanyController {
    constructor( private companyService: CompanyService ) {}

    @Get('all')
    searchCompanies(@Query('namesOnly') namesOnly ): Promise<string[] | Company[]> {
        if ( namesOnly ) {
            return this.companyService.getKnownCompanies()
        } else
            return this.companyService.getAllCompanies()
    }
}
