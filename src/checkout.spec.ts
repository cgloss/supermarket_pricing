import { Checkout, IPricingScheme } from './checkout';
import { todaysScheme } from './scheme';
import { expect } from 'chai';
import 'mocha';

const c = new Checkout(todaysScheme);

describe('Test Checkout scan method', () => {
  it('expect return of the price of item scanned if given string', () => {
    const scan1 = c.scan('1983');
    expect(scan1).to.equal(1.99);
  });
  it('expect return of the price of item scanned if given number', () => {
    const scan2 = c.scan(4900);
    expect(scan2).to.equal(3.49);
  });
});

describe('Test Checkout reviewCart method', () => {
  it('expect return of defined cart review', () => {
    c.scan('1983');
    c.scan('1983');
    const rev1 = c.reviewCart();
    expect(rev1.scannedItems).to.be.a('object');
    expect(rev1.scannedItems).to.not.equal(undefined);
    expect(rev1.promotionsUpsell.size).to.equal(1);
    expect(rev1.promotionsApplied.length).to.equal(1);
  });
});

describe('Test Checkout voidCart method', () => {
  it('expect return of reset cart', () => {
    c.voidCart();
    const rev2 = c.reviewCart();
    expect(rev2.scannedItems).to.be.deep.equal({});
    expect(rev2.promotionsUpsell.size).to.equal(0);
    expect(rev2.promotionsApplied.length).to.equal(0);
  });
});

describe('Test Checkout getTotal method', () => {
  it('scanning exercise preselected list of items should return 3037 cents', () => {
    c.scan('1983'); // toothbrush
    c.scan('4900'); // salsa
    c.scan('8873'); // milk
    c.scan('6732'); // chips
    c.scan('0923'); // wine
    c.scan('1983'); // toothbrush
    c.scan('1983'); // toothbrush
    c.scan('1983'); // toothbrush
    const cents = c.getTotal();
    expect(cents).to.equal(3037);
  });
});

describe('Test re-void cart test', () => {
  it('expect return of reset cart', () => {
    c.voidCart();
    const rev2 = c.reviewCart();
    expect(rev2.scannedItems).to.be.deep.equal({});
    expect(rev2.promotionsUpsell.size).to.equal(0);
    expect(rev2.promotionsApplied.length).to.equal(0);
  });
});

describe('Test Checkout promotions', () => {  
  it('expect wine with tax to equal 15.49', () => {
    c.scan('0923'); // wine
    const wine = c.getTotal();
    expect(wine).to.equal(1692);
    c.void('0923');
  });

  it('scanning multi combo/bundled list of items with special tax item void', () => {
    c.scan('1983'); // toothbrush
    c.scan('1983'); // toothbrush
    c.scan('1983'); // toothbrush
    c.scan('1001'); // eggs
    c.scan(8873); // milk
    c.scan('1005'); // bread
    c.scan('1983'); // toothbrush
    c.scan('1983'); // toothbrush
    c.scan('1983'); // toothbrush
    c.scan(4900); // salsa
    c.scan('1001'); // eggs
    c.scan('6732'); // chips
    const combos = c.getTotal();
    // console.log(c);
    expect(combos).to.equal(2291);
  });
});