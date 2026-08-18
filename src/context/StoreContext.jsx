import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, onAuthStateChanged } from '../config/firebase';
import { api } from '../services/api';
import { ordersApi } from '../services/ordersApi';
import { storesApi } from '../services/storesApi';
import { 
  REAL_CSV_PRODUCTS, 
  REAL_CSV_STORES, 
  REAL_CSV_INVENTORY, 
  REAL_CSV_ORDERS, 
  REAL_CSV_ALLOCATIONS,
  REAL_CSV_RISKS
} from '../data/realCsvData';

const defaultStoreValue = {
  warehouses: REAL_CSV_STORES, setWarehouses: () => {},
  products: REAL_CSV_PRODUCTS, setProducts: () => {}, createProduct: () => {}, updateProduct: () => {},
  inventory: REAL_CSV_INVENTORY, setInventory: () => {}, updateInventoryStock: () => {}, adjustStock: () => {},
  orders: REAL_CSV_ORDERS, setOrders: () => {}, allocateOrder: () => {},
  acceptAllocation: () => {}, startPicking: () => {}, completePicking: () => {},
  startPacking: () => {}, completePacking: () => {}, dispatchOrder: () => {}, fulfillOrder: () => {},
  movements: [], setMovements: () => {},
  risks: REAL_CSV_RISKS, setRisks: () => {},
  allocations: REAL_CSV_ALLOCATIONS, setAllocations: () => {},
  pickingTasks: [], setPickingTasks: () => {},
  packingTasks: [], setPackingTasks: () => {},
  dispatchQueue: [], setDispatchQueue: () => {},
  exceptions: [], setExceptions: () => {}, createException: () => {}, resolveException: () => {},
  managementActions: [], setManagementActions: () => {},
  transfers: [], setTransfers: () => {}, createTransfer: () => {},
  suppliers: [], setSuppliers: () => {},
  alerts: [], setAlerts: () => {},
  activities: [], setActivities: () => {},
  settings: { theme: "dark", autoAllocation: true, safetyBufferDays: 14 }, setSettings: () => {},
  authUser: null, setAuthUser: () => {},
  selectedWarehouseFilter: 'ALL', setSelectedWarehouseFilter: () => {},
  isRefreshing: false, triggerGlobalRefresh: () => {},
  sidebarOpen: true, toggleSidebar: () => {}, openSidebar: () => {}, closeSidebar: () => {},
  theme: "dark", toggleTheme: () => {}
};

const StoreContext = createContext(defaultStoreValue);

export function StoreProvider({ children }) {
  const [warehouses, setWarehouses] = useState(REAL_CSV_STORES);
  const [products, setProducts] = useState(REAL_CSV_PRODUCTS);
  const [inventory, setInventory] = useState(REAL_CSV_INVENTORY);
  const [orders, setOrders] = useState(REAL_CSV_ORDERS);
  const [allocations, setAllocations] = useState(REAL_CSV_ALLOCATIONS);
  const [risks, setRisks] = useState(REAL_CSV_RISKS);

  const [pickingTasks, setPickingTasks] = useState([
    { id: "pick-201", pickTicketNumber: "PK-9041", orderNumber: "ORD-2022-9003", sku: "SKU-P0003", productName: "Toys Item P0003", binLocation: "A-12-04", warehouseName: "Warehouse A (Chicago Hub)", quantity: 51, pickerName: "John Miller", status: "IN_PROGRESS", SLA: "14 mins left" },
    { id: "pick-202", pickTicketNumber: "PK-9042", orderNumber: "ORD-2022-9007", sku: "SKU-P0007", productName: "Furniture Item P0007", binLocation: "B-04-11", warehouseName: "Warehouse B (Dallas Hub)", quantity: 167, pickerName: "Sarah Davis", status: "PENDING_PICK", SLA: "30 mins left" },
    { id: "pick-203", pickTicketNumber: "PK-9043", orderNumber: "ORD-2022-9013", sku: "SKU-P0013", productName: "Toys Item P0013", binLocation: "C-09-02", warehouseName: "Warehouse C (Los Angeles Hub)", quantity: 85, pickerName: "Robert Chen", status: "COMPLETED", SLA: "On Time" },
    { id: "pick-204", pickTicketNumber: "PK-9044", orderNumber: "ORD-2022-9001", sku: "SKU-P0001", productName: "Groceries Item P0001", binLocation: "A-02-08", warehouseName: "Warehouse A (Chicago Hub)", quantity: 127, pickerName: "John Miller", status: "COMPLETED", SLA: "On Time" }
  ]);

  const [packingTasks, setPackingTasks] = useState([
    { id: "pack-301", packId: "PAC-4011", orderNumber: "ORD-2022-9004", sku: "SKU-P0004", warehouseName: "Warehouse A (Chicago Hub)", quantity: 164, boxType: "LARGE_CORRUGATED", packerName: "Dave Evans", status: "PACKED", weightKg: "14.2 kg" },
    { id: "pack-302", packId: "PAC-4012", orderNumber: "ORD-2022-9010", sku: "SKU-P0010", warehouseName: "Warehouse A (Chicago Hub)", quantity: 196, boxType: "HEAVY_DUTY_FOAM", packerName: "Linda Scott", status: "VERIFYING_BARCODE", weightKg: "18.8 kg" },
    { id: "pack-303", packId: "PAC-4013", orderNumber: "ORD-2022-9011", sku: "SKU-P0011", warehouseName: "Warehouse B (Dallas Hub)", quantity: 153, boxType: "MEDIUM_CORRUGATED", packerName: "Dave Evans", status: "PACKED", weightKg: "11.5 kg" }
  ]);

  const [dispatchQueue, setDispatchQueue] = useState([
    { id: "disp-401", dispatchManifest: "MAN-7091", orderNumber: "ORD-2022-9005", customerName: "CSV Commercial Client 5", carrier: "FedEx Freight", trackingCode: "FX-940281-US", warehouseName: "Warehouse C (Los Angeles Hub)", status: "DISPATCHED", dispatchTime: "2022-01-01 11:45" },
    { id: "disp-402", dispatchManifest: "MAN-7092", orderNumber: "ORD-2022-9009", customerName: "CSV Commercial Client 9", carrier: "UPS Ground", trackingCode: "1Z-999-001-884", warehouseName: "Warehouse C (Los Angeles Hub)", status: "DISPATCHED", dispatchTime: "2022-01-01 14:20" }
  ]);

  const [exceptions, setExceptions] = useState([
    { id: "exc-501", exceptionCode: "EXP-BIN-MISMATCH", title: "Bin Mismatch at Warehouse A", description: "System reported bin A-12-04 empty during picking task PK-9041.", warehouseName: "Warehouse A (Chicago Hub)", severity: "HIGH", status: "OPEN", assignedTo: "Inventory Lead", createdAt: "2022-01-01 08:30" },
    { id: "exc-502", exceptionCode: "EXP-BARCODE-UNREADABLE", title: "Unreadable Barcode Tag SKU-P0003", description: "Scanner failed 3 verification attempts during packing at Warehouse B.", warehouseName: "Warehouse B (Dallas Hub)", severity: "MEDIUM", status: "INVESTIGATING", assignedTo: "QA Specialist", createdAt: "2022-01-01 10:45" }
  ]);

  const [movements, setMovements] = useState([]);
  const [managementActions, setManagementActions] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [settings, setSettings] = useState({
    theme: "dark",
    autoAllocation: true,
    safetyBufferDays: 14
  });

  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  // Listen to Firebase Auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Admin User',
          photoURL: user.photoURL
        });
      } else {
        setAuthUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch real operational backend endpoints on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const prodsRes = await api.getProducts();
        if (prodsRes?.data?.length > 0) setProducts(prodsRes.data);

        const invRes = await api.getInventory();
        if (invRes?.data?.length > 0) setInventory(invRes.data);

        const risksRes = await api.getRisks();
        if (risksRes?.data?.length > 0) {
          setRisks(prev => {
            const merged = [...risksRes.data];
            REAL_CSV_RISKS.forEach(r => {
              if (!merged.some(m => m.id === r.id || (m.productId === r.productId && m.riskType === r.riskType))) {
                merged.push(r);
              }
            });
            return merged;
          });
        }

        const ordersRes = await ordersApi.getAll();
        if (ordersRes?.data?.length > 0) {
          setOrders(ordersRes.data);
        }

        const storesRes = await storesApi.getAll();
        if (storesRes?.data?.length > 0) {
          setWarehouses(storesRes.data.slice(0, 3));
        }

        const supsRes = await api.getSuppliers();
        if (supsRes?.data?.length > 0) setSuppliers(supsRes.data);

        const pickRes = await api.getPicking();
        if (pickRes?.data?.length > 0) setPickingTasks(pickRes.data);

        const packRes = await api.getPacking();
        if (packRes?.data?.length > 0) setPackingTasks(packRes.data);

        const dispRes = await api.getDispatch();
        if (dispRes?.data?.length > 0) setDispatchQueue(dispRes.data);

        const excRes = await api.getExceptions();
        if (excRes?.data?.length > 0) setExceptions(excRes.data);

        const trRes = await api.getTransfers();
        if (trRes?.data?.length > 0) setTransfers(trRes.data);

        const movRes = await api.getStockMovements();
        if (movRes?.data?.length > 0) setMovements(movRes.data);
      } catch (err) {
        console.warn("API load error:", err.message);
      }
    }
    loadBackendData();
  }, []);

  // Sliding Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('invintell-theme') || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('invintell-theme', nextTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Global Refresh Action
  const triggerGlobalRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Helper functions
  const createProduct = (productData) => {
    const newProduct = {
      id: `prod-${Date.now()}`,
      ...productData,
      status: 'NORMAL'
    };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id, updatedFields) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  const updateInventoryStock = (inventoryId, newQuantity) => {
    setInventory(prev => prev.map(item => {
      if (item.id === inventoryId || item.productId === inventoryId) {
        let newStatus = 'NORMAL';
        if (newQuantity <= 0) newStatus = 'OUT_OF_STOCK';
        else if (newQuantity < (item.minThreshold || 30)) newStatus = 'LOW';
        
        return {
          ...item,
          inventoryLevel: newQuantity,
          stockQuantity: newQuantity,
          availableQuantity: Math.max(0, newQuantity - (item.reservedQuantity || 0) - (item.damagedQuantity || 0)),
          status: newStatus
        };
      }
      return item;
    }));
  };

  const adjustStock = async (payload) => {
    try {
      const res = await api.adjustInventory(payload);
      if (res && res.success) {
        if (res.data) {
          updateInventoryStock(payload.productId, res.data.inventoryLevel || res.data.stockQuantity);
        }
        if (res.movement) {
          setMovements(prev => [res.movement, ...prev]);
        }
        return { success: true, message: res.message };
      }
    } catch (e) {}
    return { success: false, message: 'Stock adjustment failed' };
  };

  const allocateOrder = async (orderId, warehouseName) => {
    try {
      const res = await api.performAllocation({ orderId, warehouseName });
      if (res && res.success) {
        setOrders(prev => prev.map(o => (o.id === orderId || o.orderNumber === orderId) ? { ...o, status: 'ALLOCATED' } : o));
        setAllocations(prev => prev.map(a => (a.orderId === orderId || a.id === orderId || a.orderNumber === orderId) ? { ...a, status: 'ALLOCATED' } : a));
        return { success: true, message: res.message };
      }
      return { success: false, message: res?.message || 'Order allocation failed' };
    } catch (e) {
      return { success: false, message: e.message || 'API request failed' };
    }
  };

  const acceptAllocation = (orderId, warehouseName) => allocateOrder(orderId, warehouseName);

  const startPicking = (orderId) => {
    setOrders(prev => prev.map(o => (o.id === orderId || o.orderNumber === orderId) ? { ...o, status: 'PICKING' } : o));
    setPickingTasks(prev => prev.map(p => (p.orderId === orderId || p.orderNumber === orderId) ? { ...p, status: 'IN_PROGRESS' } : p));
  };

  const completePicking = async (orderId) => {
    try {
      const res = await api.completePickingTask(orderId);
      if (res && res.success) {
        setOrders(prev => prev.map(o => (o.id === orderId || o.orderNumber === orderId) ? { ...o, status: 'PICKED' } : o));
        setPickingTasks(prev => prev.map(p => (p.orderId === orderId || p.orderNumber === orderId || p.id === orderId || p.pickingId === orderId) ? { ...p, status: 'COMPLETED' } : p));
        return { success: true, message: res.message };
      }
      return { success: false, message: res?.message || 'Picking completion failed' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const startPacking = (orderId) => {
    setOrders(prev => prev.map(o => (o.id === orderId || o.orderNumber === orderId) ? { ...o, status: 'PACKING' } : o));
    setPackingTasks(prev => prev.map(p => (p.orderId === orderId || p.orderNumber === orderId) ? { ...p, status: 'IN_PROGRESS' } : p));
  };

  const completePacking = async (orderId) => {
    try {
      const res = await api.completePackingTask(orderId);
      if (res && res.success) {
        setOrders(prev => prev.map(o => (o.id === orderId || o.orderNumber === orderId) ? { ...o, status: 'PACKED' } : o));
        setPackingTasks(prev => prev.map(p => (p.orderId === orderId || p.orderNumber === orderId || p.id === orderId || p.packId === orderId) ? { ...p, status: 'PACKED' } : p));
        return { success: true, message: res.message };
      }
      return { success: false, message: res?.message || 'Packing completion failed' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const dispatchOrder = async (orderId) => {
    try {
      const res = await api.confirmDispatch(orderId);
      if (res && res.success) {
        setOrders(prev => prev.map(o => (o.id === orderId || o.orderNumber === orderId) ? { ...o, status: 'DISPATCHED' } : o));
        setDispatchQueue(prev => prev.map(d => (d.orderId === orderId || d.orderNumber === orderId || d.id === orderId || d.dispatchId === orderId) ? { ...d, status: 'DISPATCHED' } : d));
        return { success: true, message: res.message };
      }
      return { success: false, message: res?.message || 'Dispatch failed' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const fulfillOrder = (orderId) => {
    setOrders(prev => prev.map(o => (o.id === orderId || o.orderNumber === orderId) ? { ...o, status: 'FULFILLED' } : o));
  };

  const createException = async (payload) => {
    try {
      const res = await api.createException(payload);
      if (res && res.success && res.data) {
        setExceptions(prev => [res.data, ...prev]);
        return { success: true, message: res.message };
      }
      return { success: false, message: res?.message || 'Failed to create exception' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const resolveException = async (id) => {
    try {
      const res = await api.resolveException(id);
      if (res && res.success) {
        setExceptions(prev => prev.map(e => (e.id === id || e.exceptionCode === id) ? { ...e, status: 'RESOLVED' } : e));
        return { success: true, message: res.message };
      }
      return { success: false, message: res?.message || 'Failed to resolve exception' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const createTransfer = async (payload) => {
    try {
      const res = await api.createTransfer(payload);
      if (res && res.success && res.data) {
        setTransfers(prev => [res.data, ...prev]);
        return { success: true, message: res.message };
      }
      return { success: false, message: res?.message || 'Transfer creation failed' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const value = {
    warehouses, setWarehouses,
    products, setProducts, createProduct, updateProduct,
    inventory, setInventory, updateInventoryStock, adjustStock,
    orders, setOrders, allocateOrder,
    acceptAllocation, startPicking, completePicking,
    startPacking, completePacking, dispatchOrder, fulfillOrder,
    movements, setMovements,
    risks, setRisks,
    allocations, setAllocations,
    pickingTasks, setPickingTasks,
    packingTasks, setPackingTasks,
    dispatchQueue, setDispatchQueue,
    exceptions, setExceptions, createException, resolveException,
    managementActions, setManagementActions,
    transfers, setTransfers, createTransfer,
    suppliers, setSuppliers,
    alerts, setAlerts,
    activities, setActivities,
    settings, setSettings,
    authUser, setAuthUser,
    selectedWarehouseFilter, setSelectedWarehouseFilter,
    isRefreshing, triggerGlobalRefresh,
    sidebarOpen, toggleSidebar, openSidebar, closeSidebar,
    theme, toggleTheme
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  return context || defaultStoreValue;
}
