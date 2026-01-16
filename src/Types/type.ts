    // types.ts
    export type QuoteItem = {
        id: string;
        sn: number;
        name: string;
        description: string;
        makeModel: string;
        qty: number;
        unitRate: number;
        amount: number;
        image?:string;
        make:string;
        installation_amount_1:number,
        totalInstallation:number,
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

export type AccessoryOption = {
  label: string;
  value: string;
};

export type Product = {
    category_id: string | null;
    created_at: string;
    description: string | null;
    id: string;
    image_url: string | null;
    installation_amount_1: number;
    make: string | null;
    model: string | null;
    name: string;
    price: number;
    category: {
        name: string;
    } | null;
    is_accessory: boolean;
    accessory: AccessoryOption[];
}
export type ProductWithoutAccessory = Omit<Product, "accessory">;
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
        make: string | null;
        model: string | null;
        name: string;
        price: number;
    }[];
}


export type ProductInput = {
  name: string;
  description?: string;
  model?: string;
  price: number;
  make?: string;
  installation_amount_1: number;
  category_id?: string;
  imageFile: File | null;
  is_accessory: boolean;
  accessory: AccessoryOption[];
};


export type ProductWithAccessories = {
      id: string;
      category_id: string | null;
      description: string | null;
      image_url: string | null;
      installation_amount_1: number;
      make: string | null;
      model: string | null;
      name: string;
      price: number;
      catagoryName: string;
      accessories?: {
            accessory: {
                category_id: string | null;
                created_at: string;
                description: string | null;
                id: string;
                image_url: string | null;
                installation_amount_1: number;
                is_accessory: boolean;
                make: string | null;
                model: string | null;
                name: string;
                price: number;
            };
        }[];      
    }