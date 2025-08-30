// types.ts
export type QuoteItem = {
    sn: number;
    name: string;
    description: string;
    makeModel: string;
    qty: number;
    unitRate: number;
    amount: number;
    image?:string;
    make:string;
    installation_amount_2:number,
    installation_amount_1:number,
    catagoryName:string
  
  };
  
  export type QuoteData = {
    items: QuoteItem[];
    grandTotal: number;
  };
  