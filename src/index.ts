import { Checkout, IPricingScheme } from './checkout';
import { todaysScheme } from './scheme';

const c = new Checkout(todaysScheme);
  c.scan('1983'); // toothbrush
  c.scan('4900'); // salsa
  c.scan('8873'); // milk
  c.scan('6732'); // chips
  c.scan('0923'); // wine
  c.scan('1983'); // toothbrush
  c.scan('1983'); // toothbrush
  c.scan('1983'); // toothbrush

let cents = c.getTotal();
console.log(cents);
