import type { DriverRecord, RouteCustomer, VehicleRecord, WarehouseRecord } from '@/types/route'

/** Seed geo-data centred on Kozhikode (Calicut), Kerala — the "Malabar" service region */
export const WAREHOUSES: WarehouseRecord[] = [
  { id: 'wh-1', name: 'Kozhikode Central Warehouse', address: 'Mavoor Road, Kozhikode', lat: 11.2588, lng: 75.7804 },
  { id: 'wh-2', name: 'Ramanattukara Depot', address: 'NH 66, Ramanattukara', lat: 11.1899, lng: 75.8378 },
  { id: 'wh-3', name: 'Vadakara Distribution Hub', address: 'Vadakara Town', lat: 11.6065, lng: 75.5885 },
]

export const VEHICLES: VehicleRecord[] = [
  { id: 'veh-1', name: 'Tata Ace', plateNumber: 'KL-11-AB-4521', type: 'Mini Truck', capacityKg: 750, status: 'available' },
  { id: 'veh-2', name: 'Mahindra Bolero Pickup', plateNumber: 'KL-11-AC-7734', type: 'Pickup', capacityKg: 1000, status: 'available' },
  { id: 'veh-3', name: 'Eicher Pro 1049', plateNumber: 'KL-11-AD-2290', type: 'Truck', capacityKg: 3500, status: 'on_route' },
  { id: 'veh-4', name: 'Tata Ace Gold', plateNumber: 'KL-11-AE-6612', type: 'Mini Truck', capacityKg: 800, status: 'available' },
  { id: 'veh-5', name: 'Piaggio Ape Xtra', plateNumber: 'KL-11-AF-3348', type: 'Three Wheeler', capacityKg: 500, status: 'maintenance' },
  { id: 'veh-6', name: 'Ashok Leyland Dost', plateNumber: 'KL-11-AG-9081', type: 'Mini Truck', capacityKg: 1250, status: 'available' },
]

export const DRIVERS: DriverRecord[] = [
  { id: 'user-9876543210', name: 'Rahul Sharma', role: 'salesman', mobile: '9876543210' },
  { id: 'user-9876543211', name: 'Amit Delivery', role: 'deliveryAgent', mobile: '9876543211' },
  { id: 'drv-3', name: 'Sneha Reddy', role: 'salesman', mobile: '9900011122' },
  { id: 'drv-4', name: 'Vikram Singh', role: 'deliveryAgent', mobile: '9900011133' },
  { id: 'drv-5', name: 'Suresh Kumar', role: 'deliveryAgent', mobile: '9900011144' },
  { id: 'drv-6', name: 'Priya Patel', role: 'salesman', mobile: '9900011155' },
]

/** Customers spread across real Kozhikode-city neighbourhoods, ~1–14 km from the central warehouse */
export const CUSTOMERS: RouteCustomer[] = [
  { id: 'cust-1', name: 'Mananchira Supermart', address: 'Mananchira, Kozhikode', phone: '9845010001', category: 'Supermarket', avgOrderValue: 18500, lat: 11.2495, lng: 75.7772 },
  { id: 'cust-2', name: 'Palayam Grocery Hub', address: 'Palayam, Kozhikode', phone: '9845010002', category: 'Grocery', avgOrderValue: 9200, lat: 11.2545, lng: 75.7815 },
  { id: 'cust-3', name: 'Nadakkavu Fresh Mart', address: 'Nadakkavu, Kozhikode', phone: '9845010003', category: 'Grocery', avgOrderValue: 7600, lat: 11.2647, lng: 75.7789 },
  { id: 'cust-4', name: 'Vellimadukunnu Traders', address: 'Vellimadukunnu, Kozhikode', phone: '9845010004', category: 'Wholesale', avgOrderValue: 24500, lat: 11.2938, lng: 75.7621 },
  { id: 'cust-5', name: 'Thondayad Bazaar', address: 'Thondayad, Kozhikode', phone: '9845010005', category: 'Grocery', avgOrderValue: 6800, lat: 11.2739, lng: 75.7965 },
  { id: 'cust-6', name: 'Chevayur Retail Store', address: 'Chevayur, Kozhikode', phone: '9845010006', category: 'Retail', avgOrderValue: 11200, lat: 11.2811, lng: 75.7723 },
  { id: 'cust-7', name: 'Elathur Wholesale Depot', address: 'Elathur, Kozhikode', phone: '9845010007', category: 'Wholesale', avgOrderValue: 31000, lat: 11.3129, lng: 75.7659 },
  { id: 'cust-8', name: 'West Hill Provisions', address: 'West Hill, Kozhikode', phone: '9845010008', category: 'Grocery', avgOrderValue: 8900, lat: 11.2664, lng: 75.7539 },
  { id: 'cust-9', name: 'Kottooli Corner Shop', address: 'Kottooli, Kozhikode', phone: '9845010009', category: 'Retail', avgOrderValue: 5400, lat: 11.2701, lng: 75.7887 },
  { id: 'cust-10', name: 'Meenchanda Mega Store', address: 'Meenchanda, Kozhikode', phone: '9845010010', category: 'Supermarket', avgOrderValue: 21300, lat: 11.2915, lng: 75.7965 },
  { id: 'cust-11', name: 'Malaparamba Family Mart', address: 'Malaparamba, Kozhikode', phone: '9845010011', category: 'Grocery', avgOrderValue: 7100, lat: 11.2795, lng: 75.8034 },
  { id: 'cust-12', name: 'Pantheeramkavu Stores', address: 'Pantheeramkavu, Kozhikode', phone: '9845010012', category: 'Retail', avgOrderValue: 6300, lat: 11.3187, lng: 75.7902 },
  { id: 'cust-13', name: 'Beypore Fisheries & Retail', address: 'Beypore, Kozhikode', phone: '9845010013', category: 'Retail', avgOrderValue: 9800, lat: 11.1706, lng: 75.8081 },
  { id: 'cust-14', name: 'Feroke Traders', address: 'Feroke, Kozhikode', phone: '9845010014', category: 'Wholesale', avgOrderValue: 27600, lat: 11.1855, lng: 75.8125 },
  { id: 'cust-15', name: 'Ramanattukara Wholesale', address: 'Ramanattukara, Kozhikode', phone: '9845010015', category: 'Wholesale', avgOrderValue: 33200, lat: 11.1901, lng: 75.8371 },
  { id: 'cust-16', name: 'Vellayil Beach Store', address: 'Vellayil, Kozhikode', phone: '9845010016', category: 'Retail', avgOrderValue: 5900, lat: 11.2418, lng: 75.7688 },
  { id: 'cust-17', name: 'Kunduparamba Supplies', address: 'Kunduparamba, Kozhikode', phone: '9845010017', category: 'Grocery', avgOrderValue: 8200, lat: 11.3012, lng: 75.7811 },
  { id: 'cust-18', name: 'Kovoor Retail Point', address: 'Kovoor, Kozhikode', phone: '9845010018', category: 'Retail', avgOrderValue: 6700, lat: 11.2569, lng: 75.7962 },
  { id: 'cust-19', name: 'Karaparamba Grocers', address: 'Karaparamba, Kozhikode', phone: '9845010019', category: 'Grocery', avgOrderValue: 7400, lat: 11.2478, lng: 75.8103 },
  { id: 'cust-20', name: 'Vadakara Town Mart', address: 'Vadakara Town', phone: '9845010020', category: 'Supermarket', avgOrderValue: 19800, lat: 11.6041, lng: 75.5921 },
]

export function findWarehouse(id: string): WarehouseRecord | undefined {
  return WAREHOUSES.find((w) => w.id === id)
}

export function findVehicle(id: string): VehicleRecord | undefined {
  return VEHICLES.find((v) => v.id === id)
}

export function findDriver(id: string): DriverRecord | undefined {
  return DRIVERS.find((d) => d.id === id)
}

export function findCustomer(id: string): RouteCustomer | undefined {
  return CUSTOMERS.find((c) => c.id === id)
}
