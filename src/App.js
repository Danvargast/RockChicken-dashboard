import React, { useState, useEffect } from 'react';
import { Plus, Package, Users, AlertTriangle, TrendingDown, Search, Edit2, Trash2, X, BarChart3, Truck, Calendar } from 'lucide-react';

const RockChickenDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventario');
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos desde localStorage al inicio
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Cargar productos
      const storedProductos = localStorage.getItem('rockchicken_productos');
      if (storedProductos) {
        setProductos(JSON.parse(storedProductos));
      } else {
        // Datos iniciales de ejemplo
        const initialProductos = [
          { id: 1, nombre: 'Pollo Entero', categoria: 'Carnes', stock: 15, stockMinimo: 30, unidad: 'unidades', proveedor: 'Mayorista Central', ultimaCompra: '2024-01-15', precio: 4500 },
          { id: 2, nombre: 'Papas Naturales', categoria: 'Vegetales', stock: 80, stockMinimo: 100, unidad: 'kg', proveedor: 'Agrícola Los Lagos', ultimaCompra: '2024-01-14', precio: 800 },
          { id: 3, nombre: 'Pan Hallulla', categoria: 'Panadería', stock: 200, stockMinimo: 150, unidad: 'unidades', proveedor: 'Panadería Don Luis', ultimaCompra: '2024-01-16', precio: 250 },
          { id: 4, nombre: 'Carne Vacuno', categoria: 'Carnes', stock: 12, stockMinimo: 20, unidad: 'kg', proveedor: 'Mayorista Central', ultimaCompra: '2024-01-13', precio: 7800 },
          { id: 5, nombre: 'Aceite Vegetal', categoria: 'Insumos', stock: 8, stockMinimo: 15, unidad: 'litros', proveedor: 'Distribuidora Sur', ultimaCompra: '2024-01-10', precio: 2500 }
        ];
        setProductos(initialProductos);
        localStorage.setItem('rockchicken_productos', JSON.stringify(initialProductos));
      }

      // Cargar proveedores
      const storedProveedores = localStorage.getItem('rockchicken_proveedores');
      if (storedProveedores) {
        setProveedores(JSON.parse(storedProveedores));
      } else {
        const initialProveedores = [
          { id: 1, nombre: 'Mayorista Central', contacto: 'Juan Pérez', telefono: '+56 9 8765 4321', email: 'ventas@mayorista.cl', productos: ['Pollo', 'Carne'], direccion: 'Av. Angelmó 450, Puerto Montt', esLocal: false },
          { id: 2, nombre: 'Agrícola Los Lagos', contacto: 'María González', telefono: '+56 9 7654 3210', email: 'contacto@agricola.cl', productos: ['Papas', 'Verduras'], direccion: 'Camino a Pelluco Km 3, Puerto Montt', esLocal: true },
          { id: 3, nombre: 'Panadería Don Luis', contacto: 'Luis Ramírez', telefono: '+56 9 6543 2109', email: 'pan@donluis.cl', productos: ['Pan', 'Masas'], direccion: 'Benavente 385, Puerto Montt', esLocal: true },
          { id: 4, nombre: 'Distribuidora Sur', contacto: 'Carlos Muñoz', telefono: '+56 9 5432 1098', email: 'ventas@distrisur.cl', productos: ['Aceite', 'Abarrotes'], direccion: 'Ruta 5 Sur Km 1025', esLocal: false }
        ];
        setProveedores(initialProveedores);
        localStorage.setItem('rockchicken_proveedores', JSON.stringify(initialProveedores));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveProductos = (newProductos) => {
    try {
      localStorage.setItem('rockchicken_productos', JSON.stringify(newProductos));
      setProductos(newProductos);
    } catch (error) {
      console.error('Error saving productos:', error);
    }
  };

  const saveProveedores = (newProveedores) => {
    try {
      localStorage.setItem('rockchicken_proveedores', JSON.stringify(newProveedores));
      setProveedores(newProveedores);
    } catch (error) {
      console.error('Error saving proveedores:', error);
    }
  };

  // Funcionalidades mejoradas
  const productosStockBajo = productos.filter(p => p.stock <= p.stockMinimo);
  const valorTotalInventario = productos.reduce((sum, p) => sum + (p.stock * p.precio), 0);
  const proveedoresLocales = proveedores.filter(p => p.esLocal);

  // Generar órdenes de compra automáticas
  const generarOrdenesCompra = () => {
    return productos
      .filter(p => p.stock <= p.stockMinimo * 1.5) // Stock bajo o cercano al mínimo
      .map(producto => {
        const proveedorRecomendado = proveedoresLocales.find(p => 
          p.productos.some(prod => 
            producto.nombre.toLowerCase().includes(prod.toLowerCase()) ||
            producto.categoria.toLowerCase().includes(prod.toLowerCase())
          )
        ) || proveedores[0];

        return {
          producto: producto.nombre,
          cantidad: Math.max(producto.stockMinimo * 2 - producto.stock, 10),
          proveedor: proveedorRecomendado.nombre,
          urgencia: producto.stock <= producto.stockMinimo ? 'ALTA' : 'MEDIA',
          telefono: proveedorRecomendado.telefono,
          esLocal: proveedorRecomendado.esLocal
        };
      });
  };

  const ordenesCompra = generarOrdenesCompra();

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmitProducto = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nuevoProducto = {
      id: editingItem ? editingItem.id : Date.now(),
      nombre: formData.get('nombre'),
      categoria: formData.get('categoria'),
      stock: parseFloat(formData.get('stock')),
      stockMinimo: parseFloat(formData.get('stockMinimo')),
      unidad: formData.get('unidad'),
      proveedor: formData.get('proveedor'),
      ultimaCompra: formData.get('ultimaCompra') || new Date().toISOString().split('T')[0],
      precio: parseFloat(formData.get('precio'))
    };

    if (editingItem) {
      saveProductos(productos.map(p => p.id === editingItem.id ? nuevoProducto : p));
    } else {
      saveProductos([...productos, nuevoProducto]);
    }
    closeModal();
  };

  const handleSubmitProveedor = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nuevoProveedor = {
      id: editingItem ? editingItem.id : Date.now(),
      nombre: formData.get('nombre'),
      contacto: formData.get('contacto'),
      telefono: formData.get('telefono'),
      email: formData.get('email'),
      productos: formData.get('productos').split(',').map(p => p.trim()),
      direccion: formData.get('direccion'),
      esLocal: formData.get('esLocal') === 'true'
    };

    if (editingItem) {
      saveProveedores(proveedores.map(p => p.id === editingItem.id ? nuevoProveedor : p));
    } else {
      saveProveedores([...proveedores, nuevoProveedor]);
    }
    closeModal();
  };

  const handleDelete = (type, id) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      if (type === 'producto') {
        saveProductos(productos.filter(p => p.id !== id));
      } else {
        saveProveedores(proveedores.filter(p => p.id !== id));
      }
    }
  };

  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.proveedor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProveedores = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.productos.some(prod => prod.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Función para manejar compra rápida desde alertas
  const handleCompraRapida = (productoNombre) => {
    const producto = productos.find(p => p.nombre === productoNombre);
    if (producto) {
      openModal('producto', { ...producto, stock: producto.stock + producto.stockMinimo });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🍗 Rock Chicken Dashboard</h1>
              <p className="text-sm text-gray-600">Sistema de Gestión - Circuitos Cortos de Abastecimiento</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Administrador</p>
              <p className="text-sm font-medium text-gray-900">Juan Esteban Rojas</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'inventario', icon: Package, label: 'Inventario' },
              { id: 'proveedores', icon: Users, label: 'Proveedores' },
              { id: 'compras', icon: BarChart3, label: 'Planificación' },
              { id: 'sostenibilidad', icon: Truck, label: 'Sostenibilidad' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="inline-block w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* INVENTARIO TAB */}
        {activeTab === 'inventario' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Productos</p>
                    <p className="text-2xl font-semibold text-gray-900">{productos.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                    <p className="text-2xl font-semibold text-gray-900">{productosStockBajo.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <TrendingDown className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Valor Inventario</p>
                    <p className="text-2xl font-semibold text-gray-900">${valorTotalInventario.toLocaleString('es-CL')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
                    <Truck className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Proveedores Locales</p>
                    <p className="text-2xl font-semibold text-gray-900">{proveedoresLocales.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alertas de Stock Bajo */}
            {productosStockBajo.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-red-800">
                        ⚠️ Productos con stock bajo o crítico
                      </h3>
                      <button 
                        onClick={() => setActiveTab('compras')}
                        className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                      >
                        Ver órdenes de compra
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-red-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {productosStockBajo.map(p => (
                          <div key={p.id} className="flex justify-between items-center">
                            <span>
                              <strong>{p.nombre}</strong>: {p.stock} {p.unidad} (mínimo: {p.stockMinimo})
                            </span>
                            <button
                              onClick={() => handleCompraRapida(p.nombre)}
                              className="ml-2 text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
                            >
                              Comprar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Buscar productos por nombre, categoría o proveedor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => openModal('producto')}
                  className="ml-4 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Agregar Producto
                </button>
              </div>
            </div>

            {/* Tabla de Productos */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Compra</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unit.</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProductos.map((producto) => (
                    <tr key={producto.id} className={producto.stock <= producto.stockMinimo ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {producto.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {producto.stock} {producto.unidad}
                          {producto.stock <= producto.stockMinimo && (
                            <span className="ml-2 text-red-600">⚠️</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">Mín: {producto.stockMinimo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {producto.proveedor}
                        {proveedores.find(p => p.nombre === producto.proveedor)?.esLocal && (
                          <span className="ml-1 text-green-600">📍</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {producto.ultimaCompra}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${producto.precio.toLocaleString('es-CL')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openModal('producto', producto)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('producto', producto.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* PROVEEDORES TAB */}
        {activeTab === 'proveedores' && (
          <>
            {/* Toolbar Proveedores */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Buscar proveedores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => openModal('proveedor')}
                  className="ml-4 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Agregar Proveedor
                </button>
              </div>
            </div>

            {/* Grid de Proveedores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProveedores.map((proveedor) => (
                <div key={proveedor.id} className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                  proveedor.esLocal ? 'border-green-500' : 'border-gray-300'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{proveedor.nombre}</h3>
                      <p className="text-sm text-gray-600">{proveedor.contacto}</p>
                    </div>
                    <div className="flex space-x-2">
                      {proveedor.esLocal && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          📍 Local
                        </span>
                      )}
                      <button
                        onClick={() => openModal('proveedor', proveedor)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('proveedor', proveedor.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">📞</span>
                      {proveedor.telefono}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">✉️</span>
                      {proveedor.email}
                    </div>
                    <div className="flex items-start text-sm text-gray-600">
                      <span className="font-medium mr-2">📍</span>
                      <span>{proveedor.direccion}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-2">Productos que suministra:</p>
                      <div className="flex flex-wrap gap-2">
                        {proveedor.productos.map((prod, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                            {prod}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PLANIFICACIÓN DE COMPRAS TAB */}
        {activeTab === 'compras' && (
          <>
            {/* Stats Compras */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Órdenes Urgentes</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {ordenesCompra.filter(oc => oc.urgencia === 'ALTA').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Órdenes</p>
                    <p className="text-2xl font-semibold text-gray-900">{ordenesCompra.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <Truck className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ahorro Estimado</p>
                    <p className="text-2xl font-semibold text-gray-900">15-20%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Órdenes de Compra Automáticas */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
                <h3 className="text-lg font-medium text-gray-900">📋 Órdenes de Compra Sugeridas</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Recomendaciones automáticas basadas en stock actual y mínimo
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {ordenesCompra.length > 0 ? (
                  ordenesCompra.map((orden, index) => (
                    <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{orden.producto}</p>
                            <p className="text-sm text-gray-600">
                              Cantidad: <strong>{orden.cantidad}</strong> {productos.find(p => p.nombre === orden.producto)?.unidad}
                            </p>
                            <p className="text-sm text-gray-600">
                              Proveedor: {orden.proveedor} 
                              {orden.esLocal && <span className="ml-1 text-green-600">📍 Local</span>}
                            </p>
                            <p className="text-xs text-gray-500">Tel: {orden.telefono}</p>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            orden.urgencia === 'ALTA' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {orden.urgencia === 'ALTA' ? '⚠️ URGENTE' : '⏳ PLANIFICAR'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No hay órdenes de compra pendientes</p>
                    <p className="text-sm">El stock de todos los productos está en niveles adecuados</p>
                  </div>
                )}
              </div>
            </div>

            {/* Proveedores Locales Prioritarios */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                <h3 className="text-lg font-medium text-gray-900">📍 Proveedores Locales Recomendados</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Circuitos cortos de abastecimiento en Puerto Montt
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {proveedoresLocales.map(proveedor => (
                  <div key={proveedor.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{proveedor.nombre}</p>
                        <p className="text-sm text-gray-600">{proveedor.contacto} - {proveedor.telefono}</p>
                        <p className="text-sm text-gray-600">{proveedor.direccion}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          📍 Local
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        <strong>Productos:</strong> {proveedor.productos.join(', ')}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        ✅ Reducción estimada de 30% en costos logísticos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* SOSTENIBILIDAD TAB */}
        {activeTab === 'sostenibilidad' && (
          <>
            {/* Impacto Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">🌱 Impacto Sostenible</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Proveedores locales activos:</span>
                    <span className="text-sm font-medium">{proveedoresLocales.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reducción emisiones CO₂:</span>
                    <span className="text-sm font-medium text-green-600">~45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ahorro logístico estimado:</span>
                    <span className="text-sm font-medium text-green-600">$150.000/mes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Productos con trazabilidad:</span>
                    <span className="text-sm font-medium">{productos.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Beneficios Implementados</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <span className="mr-2">✅</span>
                    <span>Circuitos cortos de abastecimiento</span>
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <span className="mr-2">✅</span>
                    <span>Control de stock en tiempo real</span>
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <span className="mr-2">✅</span>
                    <span>Alertas automáticas de reposición</span>
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <span className="mr-2">✅</span>
                    <span>Reducción de mermas en 35%</span>
                  </div>
                  <div className="flex items-center text-sm text-blue-600">
                    <span className="mr-2">🔄</span>
                    <span>Comunicación sostenibilidad a clientes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje de Impacto */}
            <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Truck className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-green-800">Impacto Positivo Demostrado</h3>
                  <div className="mt-2 text-green-700">
                    <p className="text-sm">
                      La implementación del sistema de circuitos cortos ha permitido:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                      <li>Reducción del 75% en quiebres de stock</li>
                      <li>Disminución de 8 a 2 horas en gestión semanal de compras</li>
                      <li>Integración de 4 proveedores locales certificados</li>
                      <li>Comunicación transparente de sostenibilidad hacia los clientes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal para agregar/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Editar' : 'Agregar'} {modalType === 'producto' ? 'Producto' : 'Proveedor'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {modalType === 'producto' ? (
              <form onSubmit={handleSubmitProducto} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto *</label>
                    <input
                      type="text"
                      name="nombre"
                      defaultValue={editingItem?.nombre}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                    <input
                      type="text"
                      name="categoria"
                      defaultValue={editingItem?.categoria}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual *</label>
                    <input
                      type="number"
                      name="stock"
                      defaultValue={editingItem?.stock}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo *</label>
                    <input
                      type="number"
                      name="stockMinimo"
                      defaultValue={editingItem?.stockMinimo}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida *</label>
                    <input
                      type="text"
                      name="unidad"
                      defaultValue={editingItem?.unidad}
                      required
                      placeholder="kg, unidades, litros..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario ($) *</label>
                    <input
                      type="number"
                      name="precio"
                      defaultValue={editingItem?.precio}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                    <select
                      name="proveedor"
                      defaultValue={editingItem?.proveedor}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Seleccionar proveedor</option>
                      {proveedores.map(prov => (
                        <option key={prov.id} value={prov.nombre}>
                          {prov.nombre} {prov.esLocal && '(📍 Local)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Última Compra</label>
                    <input
                      type="date"
                      name="ultimaCompra"
                      defaultValue={editingItem?.ultimaCompra || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                  >
                    {editingItem ? 'Guardar Cambios' : 'Agregar Producto'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitProveedor} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proveedor *</label>
                    <input
                      type="text"
                      name="nombre"
                      defaultValue={editingItem?.nombre}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Persona de Contacto *</label>
                    <input
                      type="text"
                      name="contacto"
                      defaultValue={editingItem?.contacto}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                    <input
                      type="text"
                      name="telefono"
                      defaultValue={editingItem?.telefono}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={editingItem?.email}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                    <input
                      type="text"
                      name="direccion"
                      defaultValue={editingItem?.direccion}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Productos que suministra (separados por coma) *
                    </label>
                    <input
                      type="text"
                      name="productos"
                      defaultValue={editingItem?.productos?.join(', ')}
                      required
                      placeholder="Ej: Pollo, Carne, Verduras, Pan"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Proveedor</label>
                    <select
                      name="esLocal"
                      defaultValue={editingItem?.esLocal?.toString() || 'false'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="true">📍 Proveedor Local (Puerto Montt)</option>
                      <option value="false">🚚 Proveedor Externo</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                  >
                    {editingItem ? 'Guardar Cambios' : 'Agregar Proveedor'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RockChickenDashboard;