import {Injectable} from '@nestjs/common';
import {Observable, of} from 'rxjs';
import {Plea} from '../../model/plea/plea.model';
import {Company} from '../../model/company/company.model';
import {PLEA_STATUS} from 'pleagan-model';
import {Pleagan} from '../../model/pleagan/pleagan.model';
import {Product} from '../../model/product/product.model';

const mockPleagan = new Pleagan(
  '1',
  'DolphinOnWheels',
  'cetaceanrave@sea.com',
  'I loved this product so much and used to buy it a lot. Giving it up after going vegan has ' +
    'been hard but it needed to be done. I would be so happy if you could create a vegan ' +
    'version of this!',
  'Wellington',
);

const mockPleas = [
  new Plea(
    '1',
    '2021-02-01T01:00:00+12:00',
    new Company('1', 'Kapiti Icecream', [
        new Product('1', 'Boysenberry Icecream', false )
    ]), PLEA_STATUS.UNNOTIFIED,
    mockPleagan,
    [mockPleagan],
    '/assets/images/kapiti.jpg',
  ),
  new Plea(
    '2',
    '2021-02-02T01:00:00+12:00',
    new Company('2', 'Quorn', [
        new Product('2', 'Vegetarian Meal Meat Free Soy Free Pieces', false ),
        new Product('4', 'Vegan Meal Meat Free Soy Free Pieces', true ),
    ]), PLEA_STATUS.COMPLIED,
    mockPleagan,
    [mockPleagan],
    '/assets/images/quorn.jpeg',
  ),
  new Plea(
    '3',
    '2021-02-03T01:00:00+12:00',
    new Company('3', 'Stoneleigh', [
        new Product('3', 'Sauvignon Blanc', false ),
    ]), PLEA_STATUS.UNNOTIFIED,
    mockPleagan,
    [mockPleagan],
    '/assets/images/stoneleigh.jpeg',
  ),
];

@Injectable()
export class PleaService {
  getAllPleas(): Observable<Plea[]> {
    return of(mockPleas);
  }

  getPleaById(id: string): Observable<Plea> {
    return of(mockPleas.find((mockPlea) => mockPlea.id === id));
  }
}
