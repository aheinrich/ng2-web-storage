export interface ICustomer {
    name: string
    address: string
    phone: string
}

export interface ICustomerOrder {
    id:number;
    customerId:number;
    dateOrdered: number;
    items: Array<string>;
}

export interface ICustomerShipment {
    name: string
    po: string;
    customerId:number;
    orderId:number;
    dateShipped:number;
}