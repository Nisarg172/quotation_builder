// types.ts
export type QuoteItem = {
  id: string;
  sn: number;
  name: string;
  description: string;
  makeModel: string;
  qty: number;
  unitRate: number;
  image?: string;
  make: string;
  installation_amount: number;
  catagoryName: string;
};

export type QuoteData = {
  items: QuoteItem[];
  customerName: string;
  mobileNo: string;
  grandTotal: number;
  supplyTotal: number;
  installationTotal: number;
  gstOnInstallation: boolean;
  gstOnSupply:boolean ;
  address: string;
  isPurchesOrder: boolean;
  coumpanyId:number,
  gstNumber?: string,
};

export type Category = {
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
  installation_amount: number;
  make: string | null;
  model: string | null;
  name: string;
  price: number;
  base_quantity: number;
  category: {
    name: string;
  } | null;
  is_accessory: boolean;
  accessory: AccessoryOption[];
};
export type ProductWithoutAccessory = Omit<Product, "accessory">;
export type ProductWithCatagory = {
  id: string;
  name: string;
  product: {
    category_id: string | null;
    created_at: string;
    description: string | null;
    id: string;
    image_url: string | null;
    installation_amount: number;
    make: string | null;
    model: string | null;
    name: string;
    price: number;
  }[];
};

export type ProductInput = {
  name: string;
  description?: string;
  model?: string;
  price: number;
  make?: string;
  installation_amount: number;
  category_id?: string;
  imageFile: File | null | string;
  is_accessory: boolean;
  accessory: AccessoryOption[];
};

export type ProductWithAccessories = {
  id: string;
  category_id: string | null;
  description: string | null;
  image_url: string | null;
  installation_amount: number;
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
      base_quantity: number;
      image_url: string | null;
      installation_amount: number;
      is_accessory: boolean;
      make: string | null;
      model: string | null;
      name: string;
      price: number;
    };
  }[];
};

export type BillQuatationProduct= {
        quantity: number;
        unit_rate: number;
        // amount: number;
        installation_amount: number;
        // total_Installation: number;
        name: string;
        description: string | null;
        model: string | null;
        make: string | null;
        image_url: string | null;
        category_name:string
    }

export type billQuatationData={
    created_at: string;
    customer_id: string;
    grand_total: number;
    gst_on_installation: boolean;
    gst_on_supply: boolean;
    coumpany_id:number,
    gst_number?:string,
    id: string;
    installation_total: number;
    is_purches_order: boolean;
    supply_total: number;
    customer: {
        name: string;
        mobile_no: string;
        address: string;
    };
    bill_quatation_product: BillQuatationProduct[];
}
