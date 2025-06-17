# VendHub Inventory Management System

A modern inventory management system for vending machines, built with Next.js and Supabase.

## Features

- Authentication with Supabase
- CSV Upload with support for multiple vendor formats
- Analytics dashboard with charts
- Mobile-friendly responsive design
- Real-time inventory updates
- Top products and locations tracking

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/BitBarn771/vendhub-inventory.git
cd vendhub-inventory
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

   - Create a new Supabase project
   - **Run the SQL migration:**
     - Go to the Supabase dashboard → SQL Editor
     - Copy the contents of [`supabase/migrations/20240320000000_initial_schema.sql`](supabase/migrations/20240320000000_initial_schema.sql)
     - Paste and run the SQL to create all tables and relationships
   - Enable email authentication in Supabase Auth settings

4. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## CSV Format Support

The system supports two CSV formats:

### Vendor A Format

```csv
Location,Product,UPC,Quantity,Date
LOC1,Product 1,123456789,5,01/15/2024
```

### Vendor B Format

```csv
Store,Item,SKU,Units,Transaction Date
STORE1,Item 1,987654321,3,2024-01-15
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
vendhub-inventory/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication
│   ├── upload/            # CSV upload page
│   └── analytics/         # Analytics dashboard
├── components/            # React components
├── lib/                   # Utility functions
├── supabase/             # Supabase configuration
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

---

## Backend API Documentation

### POST `/api/upload`

- **Description:** Uploads an array of normalized sales records. Handles both supported CSV formats after normalization.
- **Request Body:**
  ```json
  {
    "sales": [
      {
        "location_code": "2.0_SW_02",
        "product_name": "Celsius Arctic",
        "product_upc": "889392014",
        "quantity": 1,
        "sold_at": "2025-06-09"
      }
    ]
  }
  ```
- **Response:**
  - `200 OK`: `{ "message": "Sales processed successfully." }`
  - `400 Bad Request`: `{ "message": "Missing required field(s) in sale #N: ..." }`
- **Validation:** All fields are required. If any are missing or invalid, the request is rejected with a 400 error and a message indicating the missing fields.

### GET `/api/analytics`

- **Description:** Returns analytics data for the dashboard.
- **Response:**
  ```json
  {
    "totalSales": 123,
    "totalProducts": 45,
    "salesByDate": [
      { "sold_at": "2025-06-09", "quantity_sold": 10 },
    ],
    "topLocations": [
      { "location_name": "2.0_SW_02", "total_sold": 50 },
    ],
    "topProducts": [
      { "product_name": "Celsius Arctic", "total_sold": 30 },
    ]
  }
  ```
- **Fields:**
  - `totalSales`: Total number of sales transactions.
  - `totalProducts`: Total number of products in the system.
  - `salesByDate`: Array of objects with `sold_at` (date) and `quantity_sold` (number of items sold on that date).
  - `topLocations`: Array of locations with the highest sales.
  - `topProducts`: Array of products with the highest sales.

### GET `/api/locations`

- **Description:** Returns a list of all locations with their codes and names.
- **Response:**
  ```json
  [
    { "id": "1", "code": "2.0_SW_02", "name": "Main Office" },
  ]
  ```

### GET `/api/locations/[id]`

- **Description:** Returns details for a specific location, including inventory and sales history.
- **Response:**
  ```json
  {
    "id": "1",
    "code": "2.0_SW_02",
    "name": "Main Office",
    "inventory": [
      {
        "product_id": "10",
        "product_name": "Celsius Arctic",
        "current_stock": 12
      }
    ],
    "salesHistory": [
      {
        "sold_at": "2025-06-09T10:00:00Z",
        "product_name": "Celsius Arctic",
        "quantity_sold": 2
      }
    ]
  }
  ```

### GET `/api/products`

- **Description:** Returns a list of all products.
- **Response:**
  ```json
  [
    { "id": "10", "upc": "889392014", "name": "Celsius Arctic" },
  ]
  ```

---

## Database Schema Documentation

**Tables:**

- **users** (managed by Supabase Auth)
- **locations**: `id`, `code`, `name`
- **products**: `id`, `upc`, `name`
- **inventory**: `id`, `location_id`, `product_id`, `current_stock`
- **sales**: `id`, `location_id`, `product_id`, `quantity_sold`, `sold_at`

**Relationships:**

- `inventory.location_id` → `locations.id`
- `inventory.product_id` → `products.id`
- `sales.location_id` → `locations.id`
- `sales.product_id` → `products.id`

**ER Diagram (textual):**

```
locations (1)---(M) inventory (M)---(1) products
locations (1)---(M) sales (M)---(1) products
```
