import { Checkout, IPricingScheme } from './checkout';
import { todaysScheme } from './scheme';
import { expect } from 'chai';
import 'mocha';

const c = new Checkout(todaysScheme);

describe('Test each method for valid result', () => {
  it('itemCheck: expect Object return if passing valid string', () => {
    const chk1 = c.itemCheck('1983');
    expect(chk1).to.be.a('object');
  });
  it('itemCheck: expect Object return if passing valid number(valid string castable)', () => {
    const chk2 = c.itemCheck(1983);
    expect(chk2).to.be.a('object');
  });
  it('itemCheck: expect Object return if passing invalid value', () => {
    const chk3 = c.itemCheck('xyz');
    expect(chk3).to.be.a('object');
  });
  
  it('scan: expect Number return of the price of item scanned if given valid string', () => {
    const scanS = c.scan('1983');
    expect(scanS).to.be.a('number');
  });
  it('scan: expect Number return of the price of item scanned if given valid number(valid string castable)', () => {
    const scanN = c.scan(1983);
    expect(scanN).to.be.a('number');
  });
  it('scan: expect Number (0) if invalid scan request)', () => {
    const scanI = c.scan('xyz');
    expect(scanI).to.be.a('number');
    expect(scanI).to.equal(0);
  });
  
  it('findPromotions: expect Array if given valid string', () => {
    const fp1 = c.findPromotions('1983');
    expect(fp1).to.be.a('array');
  });
  it('findPromotions: expect Array if given valid number(valid string castable)', () => {
    const fp2 = c.findPromotions(1983);
    expect(fp2).to.be.a('array');
  });
  it('findPromotions: expect empty Array invalid requested sku', () => {
    const fp3 = c.findPromotions('xyz');
    expect(fp3).to.be.a('array');
    expect(fp3).to.be.deep.equal([]);
  });

  it('getItemized: expects to return an Object', () => {
    const itm = c.getItemized();
    expect(itm).to.be.a('object');
  });

  it('getAppliedPromotions: expects to return an Array', () => {
    const ap = c.getAppliedPromotions();
    expect(ap).to.be.a('array');
  });

  it('getUpsellPromotions: expects to return an Set', () => {
    const up = c.getUpsellPromotions();
     expect(up.size).to.equal(1);
  });
});

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
  it('reviewCart: expects return of Object (defined cart review)', () => {
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
  it('tests the example provided in the coding exercise - preselected list of items should return 3037 cents', () => {
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

describe('Test Checkout promotions and single item void', () => {  
  it('expect wine with tax to equal 1692', () => {
    c.scan('0923'); // wine
    const wine = c.getTotal();
    expect(wine).to.equal(1692);
    c.void('0923');
  });

  it('scanning multi combo/bundled list of items with special tax item voided', () => {
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
    console.log('total: $29.88 without promotions applied');
    console.log('promotion reductions: -6.97');
    console.log('total: $22.91')
    expect(combos).to.equal(2291);
  });
});