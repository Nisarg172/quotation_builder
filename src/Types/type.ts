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
        customerName:string,
        mobileNo:string
        grandTotal: number;
    };
    
  export  type Category = {
  id: string;
  name: string;
};

export type Product = {
    category_id: string | null;
    created_at: string;
    description: string | null;
    id: string;
    image_url: string | null;
    installation_amount_1: number;
    installation_amount_2: number;
    make: string | null;
    model: string | null;
    name: string;
    price: number;
    category: {
        name: string;
    } | null;
}

export  type ProductWithCatagory={
    id: string;
    name: string;
    product: {
        category_id: string | null;
        created_at: string;
        description: string | null;
        id: string;
        image_url: string | null;
        installation_amount_1: number;
        installation_amount_2: number;
        make: string | null;
        model: string | null;
        name: string;
        price: number;
    }[];
}
