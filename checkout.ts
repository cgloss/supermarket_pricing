// making assumption in the event of a combo purchase, the items are not sharable to other combos
// making assumption that items purchased with promotion can not have more then one promotion applied
// making assumption to apply the most cost effective promotion for the customer
// making assumption that overlaping promotions are intentional or acceptable

interface IPricingScheme {
  _id: number;
  category: string;
  type: string;
  items: string[];
  name: string;
  price: number;
  tax?: number;
}

class Checkout {

  public cacheTotal: number = 0;
  public cart: Array<IPricingScheme> = [];
  public scanned: Array<string> = [];
  public total: number = 0;
  private _promotions: Array<IPricingScheme> = [];
  private _reduction: number = 0;

  constructor(public pricingScheme: Array<IPricingScheme>) {

  }

  scan(sku: string): number {
    this.cacheTotal = 0
    let price = 0;
    try {
      // apply tax and add items price to subtotal
      let item = this.pricingScheme.find(entry => entry.type === 'item' && entry.items.length === 1 && entry.items[0] === sku);
      this.cart.push(item);
      price = (item.price * (1 + item.tax));
      this.total += price;
    } catch (err) {
      console.log('item not found');
      return price;
    }
    this.scanned.push(sku);
    this.findPromotions(sku);
    return price;
  }

  findPromotions(sku: string): void {
    // concat filtered promotions relevant to this sku
    this._promotions = this._promotions.concat(this.pricingScheme.filter(entry => entry.type === 'promo' && entry.items.length >= 1 && entry.items.indexOf(sku) !== -1));
  }

  reviewCart(): Array<IPricingScheme>{
    return this.cart;
  }

  applyPromotions(): void {
    this._reduction = 0;
    // define scoped clone of cart to ensure no erroneous duplication of shared partials in promotions
    let available = this.scanned.slice();
    // sort promotions by cost savings in the event of duplicate/overlapping promos
    this._promotions.sort((a, b) => a.price - b.price);
    // for each found promotion try to apply, allowing it to fail when unmet
    for (let found of this._promotions) {
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
        // add price reduction
        this._reduction += found.price;
      }
    } 
  }

  getTotal(): number {
    if (!this.cacheTotal) {
      // apply promotions
      this.applyPromotions();
      // assumption return in cents per document
      this.cacheTotal = Math.round((this.total+this._reduction)*100);
    }
    return this.cacheTotal;
  }
}