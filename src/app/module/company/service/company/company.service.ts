import { Injectable } from '@nestjs/common';
import { PersistenceService } from '../../../shared/service/persistence/persistence.service';
import { getRepository, Repository } from 'typeorm';
import { LoggerService } from '../../../shared/service/logger/logger.service';
import { Company } from '../../../../model';

@Injectable()
export class CompanyService {
  private nameSpace = 'company-service';
  private knownCompanyNames: string[];
  companyRepository: Repository<Company>;

  constructor(
      private persistenceService: PersistenceService
  ) {
    this.persistenceService.connectionReadyEvent.attachOnce( this.initialiseRepository );
  }

  isKnownCompany( name: string ): boolean {
    return this.knownCompanyNames.filter(( knownCompanyName: string ) => knownCompanyName.toLowerCase().indexOf( name.toLowerCase() ) >= 0 ).length > 0;
  }

  getOrAddCompany( name: string ): Promise<Company> {
    return this.companyRepository.findOneOrFail({ where: { name }})
        .catch(( error ) => ( this.addCompany( name ) ))
  }

  getKnownCompanies(): Promise<string[]> {
    return new Promise( ( resolve ) => {
      resolve( this.knownCompanyNames );
    });
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  async addCompany( name: string ): Promise<Company> {
    const company = this.companyRepository.create( new Company( name ) );
    this.addCompanyToKnownCompanies( company.name );
    return this.companyRepository.save( company );
  }

  private initialiseRepository = async (): Promise<void> => {
    this.companyRepository = getRepository( Company );
    this.knownCompanyNames = await this.retrieveKnownCompanyNames();
  };

  private async retrieveKnownCompanyNames(): Promise<string[]> {
    const knownCompanies = await this.getAllCompanies();

    return knownCompanies.map(({ name }) => name);
  }

  private addCompanyToKnownCompanies( name: string ): void {
    if ( !this.isKnownCompany( name ) ) {
      this.knownCompanyNames.push( name );
    }
  }
}
