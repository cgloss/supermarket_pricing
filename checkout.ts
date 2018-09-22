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

  public applicablePromotions: Array<IPricingScheme> = [];
  public cacheTotal: number = 0;
  public cart: Array<IPricingScheme> = [];
  private _promotions: Array<IPricingScheme> = [];

  constructor(public pricingScheme: Array<IPricingScheme>) {

  }
  
  // allow terminal to item/price check
  itemCheck(sku: string): IPricingScheme {
    try {
      return this.pricingScheme.find(entry => entry.type === 'item' && entry.items.length === 1 && entry.items[0] === sku);
    } catch (err) {
      console.log('item not found');
      return null;
    }
  }

  // returns price for terminal use to display as items are scanned
  scan(sku: string): number {
    this.cacheTotal = 0;
    let item = this.itemCheck(sku);    
    if(!item){
      return null;
    }
    this.cart.push(item);
    // apply tax and add items price to subtotal
    this.findPromotions(sku);
    return (item.price * (1 + item.tax));
  }

  // allow terminal to look up item related promotions
  findPromotions(sku: string): Array<IPricingScheme> {
    let promotions = this.pricingScheme.filter(entry => entry.type === 'promo' && entry.items.length >= 1 && entry.items.indexOf(sku) !== -1);
    // concat filtered promotions relevant to this sku
    this._promotions = this._promotions.concat(promotions);
    return promotions;
  }

  // allow terminal to get current scanned items
  reviewCart(): Array<IPricingScheme> {
    return this.cart;
  }

  private validatePromotions(): void {
    this.applicablePromotions = <IPricingScheme[]>[] 
    // define array of cart sku's to ensure no erroneous duplication of shared partials in promotions
    let available = this.cart.map(entry => entry.items[0]);
    // sort promotions by cost savings in the event of duplicate/overlapping promos
    this._promotions.sort((a, b) => a.price - b.price);
    // for each found promotion try to apply, allowing it to fail when unmet
    for (let found of this._promotions) {
      // use set to verify met conditions are of unique indexes in cart
      let valid = new Set();
      for (let i = found.items.length - 1; i >= 0; i--) {
        // get index of condition item _id
        let index = available.indexOf(found.items[i]);
        // item exists in cart, increment count of conditions met
        if (index !== -1) {
          // mutate scoped cart arr but maintains index
          delete available[index];
          // add to valid indexes
          valid.add(index);
        }
      }
      // verify all nessesary conditions are met
      if (valid.size === found.items.length) {
        this.applicablePromotions.push(found);
      }
    } 
  }

  // allow terminal to void item from cart
  void(sku: string): void {
    this.cacheTotal = 0;
    let index = this.cart.findIndex(entry => entry.items[0] === sku);
    console.log(index);
    if(index !== -1){
      this.cart.splice(index, 1);
    }
  }

  // allow terminal to get the promotions applied to the current cart
  getAppliedPromotions(): Array<IPricingScheme>{
    return this.applicablePromotions;
  }

  getSum(item:IPricingScheme): number {
    return (item.price * (1 + item.tax));
  }

  getTotal(): number {
    if (!this.cacheTotal) {
      let total = this.cart.reduce((a, b) => a + this.getSum(b), 0);
      // apply promotions
      this.validatePromotions();
      let reduction = this.applicablePromotions.reduce((a, b) => a + b.price, 0);
      // assumption return in cents per document
      this.cacheTotal = Math.round((total+reduction)*100);
    }
    return this.cacheTotal;

  }
}