import { Company } from '../company/company.model';
import { Pleagan } from '../pleagan/pleagan.model';

export class Plea {
  id: string;
  status: PLEA_STATUS;
  creationTimestamp: string;
  company: Company;
  initiator: Pleagan;
  supporters: Pleagan[];
  imageUrl: string;
  constructor(
    id: string,
    creationTimestamp: string,
    company: Company,
    status: PLEA_STATUS,
    initiator: Pleagan,
    supporters: Pleagan[],
    imageUrl: string,
  ) {
    this.id = id;
    this.creationTimestamp = creationTimestamp;
    this.company = company;
    this.status = status;
    this.initiator = initiator;
    this.supporters = supporters;
    this.imageUrl = imageUrl;
  }
}

export enum PLEA_STATUS {
  UNNOTIFIED = 'Unnotified',
  NOTIFIED = 'Notified',
  RESPONDED = 'Responded',
  AWAITING = 'Awaiting',
  COMPLIED = 'Complied',
}
