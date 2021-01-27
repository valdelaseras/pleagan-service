import { ConflictException, Injectable } from '@nestjs/common';
import { PersistenceService } from '../persistence/persistence.service';
import { getRepository, QueryFailedError, Repository } from 'typeorm';
import { LoggerService } from '../logger/logger.service';
import { Company } from '../../model/company/base';

@Injectable()
export class CompanyService {
  private namespace = 'company-service';
  private knownCompanyNames: string[];
  companyRepository: Repository<Company>;
  constructor(private persistenceService: PersistenceService) {
    this.persistenceService.connectionReadyEvent.attachOnce(this.initialiseRepository);
  }

  isKnownCompany(name: string): boolean {
    return (
      this.knownCompanyNames.filter((knownCompanyName: string) => knownCompanyName.indexOf(name.toLowerCase()) >= 0)
        .length > 0
    );
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  async createCompany(name: string): Promise<Company> {
    try {
      const company = this.companyRepository.create(new Company(name));
      await this.companyRepository.save(company);
      this.addCompanyToKnownCompanies(company.name);

      return company;
    } catch (e) {
      if (e instanceof QueryFailedError && e.message.indexOf('Duplicate') >= 0) {
        LoggerService.warn(e.message, this.namespace);
        // @TODO return proper error. Is an error even likely here?
        throw new ConflictException(`Oopsie doopsie`);
      }
    }
  }

  private initialiseRepository = async (): Promise<void> => {
    this.companyRepository = getRepository(Company);
    this.knownCompanyNames = await this.retrieveKnownCompanyNames();
  };

  private async retrieveKnownCompanyNames(): Promise<string[]> {
    const knownCompanies = await this.getAllCompanies();

    return knownCompanies.map(({ name }) => name.toLowerCase());
  }

  private addCompanyToKnownCompanies(name: string): void {
    if (!this.isKnownCompany(name)) {
      this.knownCompanyNames.push(name);
    }
  }
}
