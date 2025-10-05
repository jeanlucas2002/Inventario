export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'admin' | 'manager' | 'employee';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'admin' | 'manager' | 'employee';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'admin' | 'manager' | 'employee';
          created_at?: string;
          updated_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          code: string;
          image_url: string | null;
          type: string;
          brand: string;
          model: string;
          year_range: string | null;
          stock: number;
          min_stock: number;
          unit_price: number;
          supplier_id: string | null;
          warehouse_location: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          image_url?: string | null;
          type: string;
          brand: string;
          model: string;
          year_range?: string | null;
          stock?: number;
          min_stock?: number;
          unit_price: number;
          supplier_id?: string | null;
          warehouse_location?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          image_url?: string | null;
          type?: string;
          brand?: string;
          model?: string;
          year_range?: string | null;
          stock?: number;
          min_stock?: number;
          unit_price?: number;
          supplier_id?: string | null;
          warehouse_location?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          created_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          sale_number: string;
          customer_id: string | null;
          customer_name: string;
          subtotal: number;
          discount: number;
          total: number;
          payment_method: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_number: string;
          customer_id?: string | null;
          customer_name: string;
          subtotal?: number;
          discount?: number;
          total?: number;
          payment_method: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          sale_number?: string;
          customer_id?: string | null;
          customer_name?: string;
          subtotal?: number;
          discount?: number;
          total?: number;
          payment_method?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string | null;
          product_code: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total: number;
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_id?: string | null;
          product_code: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          total: number;
        };
        Update: {
          id?: string;
          sale_id?: string;
          product_id?: string | null;
          product_code?: string;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
        };
      };
      inventory_movements: {
        Row: {
          id: string;
          product_id: string;
          movement_type: 'entry' | 'exit' | 'adjustment';
          quantity: number;
          reason: string;
          reference_id: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          movement_type: 'entry' | 'exit' | 'adjustment';
          quantity: number;
          reason: string;
          reference_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          movement_type?: 'entry' | 'exit' | 'adjustment';
          quantity?: number;
          reason?: string;
          reference_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      generate_sale_number: {
        Returns: string;
      };
    };
  };
}
