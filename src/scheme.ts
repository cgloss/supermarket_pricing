import { IPricingScheme } from './checkout';

export const todaysScheme: IPricingScheme[] = [
  {_id:1,category:'simple',type:'item',items:['1001'],name:'eggs',price:2.99,tax:0},
  {_id:2,category:'simple',type:'item',items:['8873'],name:'milk',price:2.49,tax:0},
  {_id:3,category:'simple',type:'item',items:['1983'],name:'toothbrush',price:1.99,tax:0},
  {_id:4,category:'buy-x-get-y',type:'promo',items:['1983','1983','1983'],name:'toothbrushes',price:-1.99,tax:0},
  {_id:5,category:'simple',type:'item',items:['1005'],name:'bread',price:3.49,tax:0},
  {_id:6,category:'simple',type:'item',items:['1006'],name:'soda',price:5.99,tax:0},
  {_id:7,category:'additional-tax',type:'item',items:['0923'],name:'wine',price:15.49,tax:.0925},
  {_id:8,category:'simple',type:'item',items:['1008'],name:'apples',price:1.00,tax:0},
  {_id:9,category:'simple',type:'item',items:['6732'],name:'chips',price:2.49,tax:0},
  {_id:10,category:'simple',type:'item',items:['4900'],name:'salsa',price:3.49,tax:0},
  {_id:11,category:'bundled',type:'promo',items:['6732','4900'],name:'chips and salsa combo',price:-.99,tax:0},
  {_id:13,category:'bundled',type:'promo',items:['1001','1005','8873'],name:'eggs bread and milk inclement weath combo',price:-2.00,tax:0}
];