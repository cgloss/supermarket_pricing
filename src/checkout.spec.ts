import { Checkout, IPricingScheme } from './checkout';
import { expect } from 'chai';
import 'mocha';

// define c for testing Checkout methods
const c = new Checkout(todaysScheme);

describe('Scan method', () => {

  it('should return the price of item scanned', () => {
    const result = c.scan('1983');
    expect(result).to.equal({_id:3,category:'simple',type:'item',items:['1983'],name:'toothbrush',price:1.99,tax:0});
  });

});