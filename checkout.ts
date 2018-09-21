// making assumption in the event of a combo purchase, the items are not sharable to other combos
// making assumption that items purchased with promotion can not have more then one promotion applied
// making assumption to apply the most cost effective promotion for the customer
// making assumption that overlaping promotions are intentional or acceptable

interface IPricingSchemeEntries {
  _id: number;
  category: string;
  type: string;
  items: string[];
  name: string;
  price: number;
  tax?: number;
}

class Checkout {

  public cart: Array<string> = [];
  public total: number = 0;

  constructor(public pricingScheme: Array<IPricingSchemeEntries>) {

  }

  scan(sku: string): void {
    // if we were passing more then a single id use concat, push is more performant though mutates
    this.cart.push(sku);
  }

  getTotal(): number {
    // define scoped clone of cart to ensure no erroneous duplication of shared partials in promotions
    let available = this.cart.slice();
    // for each item in cart
    for (let i = this.cart.length - 1; i >= 0; i--) {

      try {
        // apply tax and add items price to subtotal
        let item = this.pricingScheme.find(entry => entry.type === 'item' && entry.items.length === 1 && entry.items[0] === this.cart[i]);
        this.total += (item.price * (1 + item.tax));
      } catch (err) {
        console.log('item code not found');
        continue;
      }

      // filter promotions to just those relevant to this cart item
      let promotions = this.pricingScheme.filter(entry => entry.type === 'promo' && entry.items.length >= 1 && entry.items.includes(this.cart[i]));
      // sort promotions by cost savings in the event of duplicate/overlapping promos
      promotions.sort((a, b) => a.price - b.price);

      // for each found promotion try to apply, allowing it to fail when unmet
      for (let found of promotions) {
        try {
          // use set to verify met conditions are of unique indexes in cart
          let valid = new Set();
          for (let j = found.items.length - 1; j >= 0; j--) {
            // scoped clone of current items promotion availability
            let arr = available.slice();
            // get index of condition item _id
            let index = arr.indexOf(found.items[j]);
            // item exists in cart, increment count of conditions met
            if (index !== -1) {
              // mutate scoped cart arr but maintains index
              delete arr[index];
              // add to valid indexes
              valid.add(index);
              // update available with clone
              available = arr.slice();
            }
          }
          // verify all nessesary conditions are met
          if (valid.size === found.items.length) {
            // log promotion with all conditions validated
            console.log(found);
            // apply promoti to total
            this.total += found.price;
          }
        } catch (err) {
          console.log('promotion not applicable');
        }
      }
    }
    return Math.round(this.total*100);
  }
}

let todaysScheme = [
  {_id:1,category:'simple',type:'item',items:['1001'],name:'eggs',price:2.99,tax:0},
  {_id:2,category:'simple',type:'item',items:['8873'],name:'milk',price:3.99,tax:0},
  {_id:3,category:'simple',type:'item',items:['1983'],name:'toothbrush',price:1.99,tax:0},
  {_id:4,category:'buy-x-get-y',type:'promo',items:['1983','1983','1983'],name:'toothbrushes',price:-1.99,tax:0},
  {_id:5,category:'simple',type:'item',items:['1005'],name:'bread',price:3.49,tax:0},
  {_id:6,category:'simple',type:'item',items:['1006'],name:'soda',price:5.99,tax:0},
  {_id:7,category:'additional-tax',type:'item',items:['0923'],name:'wine',price:15.49,tax:.0925},
  {_id:8,category:'simple',type:'item',items:['1008'],name:'apples',price:1.00,tax:0},
  {_id:9,category:'simple',type:'item',items:['6732'],name:'chips',price:2.49,tax:0},
  {_id:10,category:'simple',type:'item',items:['4900'],name:'salsa',price:3.49,tax:0},
  {_id:11,category:'bundled',type:'promo',items:['6732','4900'],name:'chips and salsa combo',price:-.99,tax:0},
  {_id:12,category:'sale',type:'promo',items:['1001'],name:'egg sale',price:-1.00,tax:0}
];

let c = new Checkout(todaysScheme);
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
console.log(3037 === cents);
console.log("$"+(cents/100));
