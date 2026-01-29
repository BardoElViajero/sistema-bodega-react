import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, Database, 
  BarChart3, Trash2, AlertTriangle, Printer, QrCode, ShoppingCart, 
  X, CheckCircle, Users, Package, Search, Box, 
  FileText, Upload, Download, History, Edit, 
  FolderOpen, Lock, Camera, LogOut, ShieldCheck, RotateCcw, Menu,
  Hammer, Wifi, Plus, Minus
} from 'lucide-react';
import { Html5QrcodeScanner } from "html5-qrcode";

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy 
} from "firebase/firestore";
import { 
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged 
} from "firebase/auth";

// ==============================================================================
// 🔴 CONFIGURACIÓN FIREBASE
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const ALLOWED_DOMAIN = "@telconor"; 
// ==============================================================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- UI Components ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow p-4 ${className}`}>{children}</div>
);

const Button = ({ onClick, children, variant = "primary", className = "", disabled = false, type="button", title="" }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 justify-center";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed",
    danger: "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300",
    success: "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed",
    warning: "bg-amber-500 text-white hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100",
  };
  return <button type={type} title={title} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

const Input = ({ label, ...props }) => (
  <div className="mb-2">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none" {...props} />
  </div>
);

const Notification = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed top-5 right-5 left-5 md:left-auto bg-gray-800 text-white px-6 py-4 rounded-lg shadow-xl z-[70] flex items-center gap-3 animate-bounce justify-between md:justify-start">
      <div className="flex items-center gap-3">
        <CheckCircle className="text-green-400 flex-shrink-0" />
        <div className="text-sm md:text-base">{message}</div>
      </div>
      <button onClick={onClose}><X className="w-5 h-5 opacity-50 hover:opacity-100"/></button>
    </div>
  );
};

// --- LOGIN ---
const LoginView = () => {
    const [error, setError] = useState(null);
    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const email = result.user.email;
            if (ALLOWED_DOMAIN && !email.toLowerCase().includes(ALLOWED_DOMAIN.toLowerCase())) {
                await signOut(auth);
                setError(`Acceso denegado. Solo correos ${ALLOWED_DOMAIN}`);
                return;
            }
        } catch (err) { setError("Error al iniciar sesión: " + err.message); }
    };
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
                <div className="mb-6 flex justify-center"><div className="bg-blue-100 p-4 rounded-full"><Database className="w-12 h-12 text-blue-600" /></div></div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Bodega Telconor</h1>
                <p className="text-gray-500 mb-8">Acceso exclusivo para personal autorizado</p>
                {error && (<div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-bold flex items-center gap-2 justify-center"><AlertTriangle className="w-4 h-4"/> {error}</div>)}
                <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-lg transition-all shadow-sm hover:shadow-md">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-6 h-6"/> Continuar con Google
                </button>
            </div>
        </div>
    );
};

// --- ESCÁNER ---
const BarcodeScanner = ({ onScan, onClose }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 }, false);
    scanner.render((decodedText) => { onScan(decodedText); scanner.clear(); }, (error) => {});
    return () => { scanner.clear().catch(e => console.error(e)); };
  }, [onScan]);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-4 rounded-xl w-full max-w-sm relative shadow-2xl animate-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-2 right-2 bg-gray-100 text-gray-600 p-2 rounded-full hover:bg-red-100 hover:text-red-600"><X className="w-6 h-6"/></button>
        <h3 className="text-lg font-bold mb-4 text-center flex items-center justify-center gap-2"><Camera className="w-5 h-5 text-blue-600"/> Escáner</h3>
        <div id="reader" className="w-full overflow-hidden rounded-lg border-2 border-slate-200"></div>
      </div>
    </div>
  );
};

// --- MODAL CANTIDAD ---
const QuantityModal = ({ product, type, currentCartQty, onClose, onConfirm }) => {
  const [qty, setQty] = useState(1);
  const inputRef = useRef(null);
  useEffect(() => { if (inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, []);
  if (!product) return null;
  const isAddingStock = type === 'in' || type === 'return'; 
  const maxStock = isAddingStock ? 999999 : (product.stock - currentCartQty);
  const isStockError = !isAddingStock && qty > maxStock;
  const handleSubmit = (e) => { e.preventDefault(); if (qty > 0 && !isStockError) onConfirm(product, parseInt(qty)); };
  const getHeaderColor = () => { if (type === 'in') return 'bg-green-600'; if (type === 'return') return 'bg-amber-500'; return 'bg-blue-600'; };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className={`p-4 ${getHeaderColor()} text-white flex justify-between items-center`}>
          <h3 className="text-xl font-bold">{type === 'in' ? 'Ingresar Stock' : type === 'return' ? 'Devolver Material' : 'Retirar Producto'}</h3>
          <button onClick={onClose}><X className="w-6 h-6"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center"><h4 className="text-xl font-bold text-gray-800">{product.name}</h4><p className="text-sm text-gray-500 font-mono">{product.sku}</p></div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center"><p className="text-sm text-gray-500 uppercase tracking-wide">Stock Actual</p><p className={`text-3xl font-bold ${product.stock === 0 ? 'text-red-500' : 'text-gray-800'}`}>{product.stock}</p></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input ref={inputRef} type="number" min="1" max={isAddingStock ? undefined : maxStock} className={`w-full text-center text-4xl p-4 border-2 rounded-lg outline-none ${isStockError ? 'border-red-500 bg-red-50 text-red-900' : 'border-blue-500 focus:ring-4 focus:ring-blue-100'}`} value={qty} onChange={(e) => setQty(e.target.value)} />
            {isStockError && <p className="text-red-500 text-sm mt-1 font-bold text-center">¡No puedes retirar más de lo que existe!</p>}
          </div>
          <div className="flex gap-3 pt-2"><Button variant="outline" className="flex-1 py-4" onClick={onClose}>Cancelar</Button><Button type="submit" variant={type === 'return' ? "warning" : (type === 'in' ? "success" : "primary")} className="flex-1 py-4" disabled={isStockError || qty <= 0 || (!isAddingStock && maxStock === 0)}>Confirmar</Button></div>
        </form>
      </div>
    </div>
  );
};

// --- TRANSACTION VIEW ---
const TransactionView = ({ type, products, cart, technicians, technician, setTechnician, invoiceNumber, setInvoiceNumber, invoiceFileName, handleInvoiceFile, initiateAddToCart, removeFromCart, processTransaction, invoices, downloadPdf, incrementCartItem, decrementCartItem, onRedirectToRepo, isRestricted, showMessage }) => {
  const [scanInput, setScanInput] = useState('');
  const [filterText, setFilterText] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const isIngreso = type === 'in';
  const isDevolucion = type === 'return';
  const theme = isIngreso ? { icon: <ArrowDownToLine className="text-green-600"/>, btn: 'success', title: 'Ingreso', bg: 'bg-green-50' } : isDevolucion ? { icon: <RotateCcw className="text-amber-500"/>, btn: 'warning', title: 'Devolución', bg: 'bg-amber-50' } : { icon: <ArrowUpFromLine className="text-blue-600"/>, btn: 'primary', title: 'Salida', bg: 'bg-blue-50' };

  const filteredProducts = useMemo(() => products.filter(p => {
      const name = p.name ? p.name.toLowerCase() : '';
      const sku = p.sku ? p.sku.toLowerCase() : '';
      const filter = filterText.toLowerCase();
      return name.includes(filter) || sku.includes(filter);
  }), [products, filterText]);
    
  const handleScanSubmit = () => { 
      if (!scanInput) return;
      const exactMatch = products.find(p => (p.sku && p.sku.toLowerCase() === scanInput.toLowerCase()) || (p.name && p.name.toLowerCase() === scanInput.toLowerCase()));
      if (exactMatch) initiateAddToCart(exactMatch.id);
      else if (filteredProducts.length > 0) initiateAddToCart(filteredProducts[0].id);
      setScanInput(''); setFilterText(''); 
  };

  const handleCameraScan = (decodedText) => {
    setShowScanner(false); setScanInput(''); setFilterText('');
    const exactMatch = products.find(p => (p.sku && p.sku.toLowerCase() === decodedText.toLowerCase()) || (p.name && p.name.toLowerCase() === decodedText.toLowerCase()));
    if (exactMatch) { showMessage(`📸 Producto: ${exactMatch.name}`); initiateAddToCart(exactMatch.id); } 
    else alert(`⚠️ Producto "${decodedText}" no encontrado.`);
  };

  const InvoiceHistoryPanel = () => {
      if (!isIngreso || isRestricted) return null; 
      return (
          <div className="mt-8 border-t pt-4">
              <h3 className="font-bold text-gray-600 mb-2 flex items-center gap-2"><History className="w-4 h-4"/> Últimas Facturas</h3>
              <div className="bg-gray-50 rounded-lg p-2 max-h-40 overflow-y-auto space-y-2">
                  {invoices.slice(0, 5).map(inv => (
                      <div key={inv.id} onClick={onRedirectToRepo} className="text-xs bg-white p-2 rounded border flex justify-between items-center cursor-pointer hover:bg-blue-50 transition-colors group">
                          <div><span className="font-bold text-gray-700 group-hover:text-blue-600">Fac: {inv.number}</span><span className="text-gray-400 ml-2 hidden md:inline">{new Date(inv.date).toLocaleDateString()}</span></div>
                          {inv.file && (<button onClick={(e) => { e.stopPropagation(); downloadPdf(inv.file, inv.fileName); }} className="text-blue-600 hover:text-blue-800"><Download className="w-4 h-4"/></button>)}
                      </div>
                  ))}
              </div>
          </div>
      )
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 h-auto lg:h-[calc(100vh-140px)]">
      {showScanner && <BarcodeScanner onScan={handleCameraScan} onClose={() => setShowScanner(false)} />}
      <div className="flex flex-col gap-4 h-auto lg:h-full overflow-visible lg:overflow-hidden order-2 lg:order-1">
        <Card className="flex-shrink-0">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">{theme.icon} {theme.title} {isRestricted && <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full flex items-center gap-1"><Lock className="w-3 h-3"/> Kiosco</span>}</h2>
          {isIngreso ? (
            <div className="mb-4 bg-green-50 p-3 rounded-lg border border-green-200 space-y-3">
               <div><label className="block text-xs font-bold text-green-800 mb-1">Nº FACTURA</label><input type="text" placeholder="Ej: 123456" className="w-full p-2 border rounded font-bold uppercase" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} /></div>
               <div><label className="block text-xs font-bold text-green-800 mb-1">ADJUNTAR PDF</label><div className="flex gap-2 items-center"><label className="cursor-pointer bg-white border border-green-300 text-green-700 px-3 py-2 rounded text-xs md:text-sm flex items-center gap-2 hover:bg-green-50 w-full md:w-auto justify-center"><Upload className="w-4 h-4"/> {invoiceFileName ? "Cargado" : "Subir"}<input type="file" accept="application/pdf" className="hidden" onChange={handleInvoiceFile}/></label><span className="text-xs text-gray-500 truncate max-w-[100px]">{invoiceFileName}</span></div></div>
            </div>
          ) : (
            <div className={`mb-4 ${isDevolucion ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'} p-3 rounded-lg border`}>
              <label className="block text-xs font-bold text-gray-700 mb-1">TÉCNICO {isDevolucion ? '(QUIEN DEVUELVE)' : ''}</label>
              <div className="flex gap-2"><Users className="text-gray-400 w-5 h-5 mt-2" /><select className="w-full p-2 border rounded-md bg-white font-medium" value={technician} onChange={(e) => setTechnician(e.target.value)}><option value="">-- SELECCIONAR --</option>{technicians.map(tech => (<option key={tech.id} value={tech.name}>{tech.name}</option>))}</select></div>
            </div>
          )}
          <div className={`p-4 rounded-lg ${theme.bg} border`}><label className="block text-sm font-bold mb-2">BUSCAR PRODUCTO</label><div className="flex gap-2"><Button onClick={() => setShowScanner(true)} variant="outline" className="px-3" title="Escanear"><QrCode className="w-5 h-5"/></Button><div className="relative flex-1"><Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" /><input type="text" value={scanInput} list="product-suggestions" onChange={(e) => { setScanInput(e.target.value); setFilterText(e.target.value); }} onKeyDown={(e) => e.key === 'Enter' && handleScanSubmit()} placeholder="Nombre o SKU..." className="w-full pl-9 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"/><datalist id="product-suggestions">{products.map(p => (<option key={p.id} value={p.name}>{p.sku}</option>))}</datalist></div><Button onClick={handleScanSubmit} variant={theme.btn}><CheckCircle className="w-4 h-4" /></Button></div></div>
          {/* Historial rápido facturas */}
          {(!isIngreso || isRestricted) ? null : <InvoiceHistoryPanel />}
        </Card>
        
        <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col min-h-[300px] h-96 lg:h-auto">
          <div className="p-3 bg-gray-50 border-b font-bold text-gray-500 text-xs uppercase flex justify-between"><span>Catálogo</span><span>{filteredProducts.length} Items</span></div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredProducts.length === 0 && (<div className="h-full flex flex-col items-center justify-center text-gray-400"><Package className="w-12 h-12 opacity-20 mb-2"/><p>No se encontraron productos</p></div>)}
            {filteredProducts.map(p => { 
              const stockStatus = p.stock <= p.crit ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'; 
              return ( 
                <div key={p.id} onClick={() => initiateAddToCart(p.id)} className={`p-3 border rounded-lg cursor-pointer transition-all flex justify-between items-center group ${stockStatus}`}>
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs">{p.name.substring(0,2).toUpperCase()}</div><div><div className="font-bold text-gray-800 text-sm">{p.name}</div><div className="text-xs text-gray-500 font-mono">{p.sku}</div></div></div>
                  <div className="text-right"><span className={`block font-bold text-lg ${p.stock <= p.crit ? 'text-red-600' : 'text-gray-700'}`}>{p.stock}</span></div>
                </div> 
              )
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-col h-auto lg:h-full order-1 lg:order-2">
        <Card className={`flex-1 flex flex-col h-full border-l-0 lg:border-l-4 ${theme.border} ${cart.length > 0 ? 'bg-blue-50 lg:bg-white' : ''}`}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 pb-4 border-b"><ShoppingCart className="w-5 h-5"/> Carrito ({cart.length})</h3>
          <div className="flex-1 overflow-y-auto mb-4 space-y-2 max-h-60 lg:max-h-full">
            {cart.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-gray-400 py-4"><Box className="w-16 h-16 mb-4 opacity-20"/><p>Lista vacía</p><p className="text-xs">Agrega productos</p></div>) : (cart.map(item => (<div key={item.id} className="flex flex-col bg-white p-3 rounded border border-gray-200 shadow-sm"><div className="flex justify-between items-start mb-2"><div><div className="font-bold text-sm text-gray-800">{item.name}</div><div className="text-xs text-gray-500">{item.sku}</div></div><button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button></div><div className="flex justify-between items-center mt-2 bg-gray-50 p-1 rounded"><span className="text-xs font-bold text-gray-500 uppercase ml-2">Cantidad:</span><div className="flex items-center gap-3"><button onClick={() => decrementCartItem(item.id)} className="w-8 h-8 flex items-center justify-center bg-white border rounded hover:bg-gray-100 text-gray-600 font-bold">-</button><span className="font-bold text-lg w-8 text-center">{item.qty}</span><button onClick={() => incrementCartItem(item.id)} className="w-8 h-8 flex items-center justify-center bg-white border rounded hover:bg-gray-100 text-blue-600 font-bold">+</button></div></div></div>)))}
          </div>
          <div className="pt-4 border-t mt-auto"><Button variant={theme.btn} className="w-full py-4 text-lg shadow-lg" onClick={() => processTransaction(type)} disabled={cart.length === 0}>{isIngreso ? "GUARDAR" : (isDevolucion ? "DEVOLVER" : "CONFIRMAR")}</Button></div>
        </Card>
      </div>
    </div>
  );
};

// --- DATABASE VIEW ---
const DatabaseView = ({ activeTab, setActiveTab, showMessage, user }) => { 
    const [isAdding, setIsAdding] = useState(false); 
    const [editingProduct, setEditingProduct] = useState(null); 
    const [formData, setFormData] = useState({ name: '', sku: '', min: 0, crit: 0, stock: 0 }); 
    const [newTechName, setNewTechName] = useState('');
    const [viewInvoice, setViewInvoice] = useState(null); 
    const [invoiceSearchTerm, setInvoiceSearchTerm] = useState(''); 
    const [showScanner, setShowScanner] = useState(false);
    const [printing, setPrinting] = useState(false);
    const [productFilter, setProductFilter] = useState('all'); 

    const [products, setProducts] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        const u1 = onSnapshot(query(collection(db, "products"), orderBy("name")), (s) => setProducts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const u2 = onSnapshot(query(collection(db, "technicians"), orderBy("name")), (s) => setTechnicians(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        const u3 = onSnapshot(query(collection(db, "invoices"), orderBy("date", "desc")), (s) => setInvoices(s.docs.map(d => ({ id: d.id, ...d.data() }))));
        return () => { u1(); u2(); u3(); };
    }, []);
    
    const filteredProducts = products.filter(p => {
        if (productFilter === 'critical') return p.stock <= p.crit;
        if (productFilter === 'low') return p.stock <= p.min;
        return true;
    });

    const handleSubmitProduct = async (e) => { 
        e.preventDefault(); 
        if (formData.stock < 0 || formData.min < 0 || formData.crit < 0) { alert("No se permiten valores negativos"); return; }
        try { 
            await addDoc(collection(db, "products"), { ...formData, stock: parseInt(formData.stock), min: parseInt(formData.min), crit: parseInt(formData.crit) }); 
            setFormData({ name: '', sku: '', min: 0, crit: 0, stock: 0 }); setIsAdding(false); showMessage("Producto creado exitosamente");
        } catch (e) { alert("Error: " + e.message); }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault(); if (!editingProduct) return;
        if (editingProduct.stock < 0 || editingProduct.min < 0 || editingProduct.crit < 0) { alert("⚠️ Error: No se permiten valores negativos."); return; }
        try {
            await updateDoc(doc(db, "products", editingProduct.id), {
                name: editingProduct.name, sku: editingProduct.sku, stock: parseInt(editingProduct.stock), min: parseInt(editingProduct.min), crit: parseInt(editingProduct.crit)
            });
            setEditingProduct(null); showMessage("✅ Producto actualizado");
        } catch (e) { alert("Error: " + e.message); }
    };

    const handleDelete = async (col, id) => { 
        if(window.confirm("¿Eliminar registro permanentemente?")) { 
            try { await deleteDoc(doc(db, col, id)); showMessage("🗑️ Registro eliminado"); } catch (e) { alert("Error: " + e.message); }
        }
    };
    
    const handleSkuScan = (decodedText) => { setFormData(prev => ({ ...prev, sku: decodedText })); setShowScanner(false); };
    const handlePrintQRs = () => {
        setPrinting(true); const win = window.open('', '', 'height=700,width=900');
        let html = '<html><head><title>Imprimir QR</title><style>body { font-family: sans-serif; } .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 20px; } .card { border: 1px dashed #ccc; padding: 10px; text-align: center; } .sku { font-size: 10px; color: #555; } img { width: 100px; height: 100px; }</style></head><body><h2 style="text-align:center;">Códigos QR</h2><div class="grid">';
        products.forEach(p => { html += `<div class="card"><img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(p.sku)}" /><br><strong>${p.name}</strong><br><span class="sku">${p.sku}</span></div>`; });
        html += '</div></body></html>'; win.document.write(html); win.document.close(); setTimeout(() => { win.print(); setPrinting(false); }, 1000);
    };
    const handleAddTech = async (e) => { e.preventDefault(); if(!newTechName.trim()) return; try { await addDoc(collection(db, "technicians"), { name: newTechName }); setNewTechName(''); } catch (e) { alert("Error"); }};

    const allInvoices = useMemo(() => {
        return invoices.map(i => ({ id: i.id, date: i.date, type: 'Ingreso Bodega', ref: i.number, file: i.file, name: i.fileName, total: i.totalItems || 0, items: i.items || [] }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [invoices]);

    const filteredInvoices = useMemo(() => {
        if (!invoiceSearchTerm) return allInvoices;
        return allInvoices.filter(inv => inv.ref.toString().toLowerCase().includes(invoiceSearchTerm.toLowerCase()) || inv.type.toLowerCase().includes(invoiceSearchTerm.toLowerCase()));
    }, [allInvoices, invoiceSearchTerm]);

    const EditProductModal = () => {
        if (!editingProduct) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                    <div className="p-4 bg-blue-600 text-white flex justify-between items-center"><h3 className="font-bold">Editar Producto</h3><button onClick={() => setEditingProduct(null)}><X className="w-5 h-5"/></button></div>
                    <form onSubmit={handleUpdateProduct} className="p-4 space-y-3">
                        <Input label="Nombre Producto" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                        <Input label="SKU / Código" value={editingProduct.sku} onChange={e => setEditingProduct({...editingProduct, sku: e.target.value})} />
                        <div className="grid grid-cols-3 gap-2">
                            <Input type="number" min="0" label="Stock" className="bg-blue-50" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})} />
                            <Input type="number" min="0" label="Mínimo" value={editingProduct.min} onChange={e => setEditingProduct({...editingProduct, min: e.target.value})} />
                            <Input type="number" min="0" label="Crítico" value={editingProduct.crit} onChange={e => setEditingProduct({...editingProduct, crit: e.target.value})} />
                        </div>
                        <div className="flex gap-2 pt-2"><Button variant="outline" className="flex-1" onClick={() => setEditingProduct(null)}>Cancelar</Button><Button type="submit" variant="primary" className="flex-1">Guardar</Button></div>
                    </form>
                </div>
            </div>
        );
    };

    const InvoiceDetailModal = () => {
        if (!viewInvoice) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setViewInvoice(null)}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="p-4 bg-gray-800 text-white flex justify-between items-center"><div><h3 className="font-bold text-lg">Factura / Orden: {viewInvoice.ref}</h3><p className="text-xs text-gray-400">{new Date(viewInvoice.date).toLocaleDateString()}</p></div><button onClick={() => setViewInvoice(null)}><X className="w-6 h-6"/></button></div>
                    <div className="p-4 overflow-y-auto bg-gray-50 flex-1"><h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Detalle de Materiales</h4><div className="space-y-2">{viewInvoice.items && viewInvoice.items.length > 0 ? (viewInvoice.items.map((item, idx) => (<div key={idx} className="bg-white p-3 rounded border border-gray-200 flex justify-between items-center"><span className="font-medium text-gray-800 text-sm">{item.name}</span><span className="font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">x{item.qty}</span></div>))) : (<p className="text-center text-gray-400 text-sm">No hay detalle disponible</p>)}</div></div>
                    <div className="p-4 bg-white border-t flex justify-end"><Button onClick={() => setViewInvoice(null)} variant="outline">Cerrar</Button></div>
                </div>
            </div>
        );
    };
    const downloadPdf = (base64, name) => { const link = document.createElement("a"); link.href = base64; link.download = name || "documento.pdf"; document.body.appendChild(link); link.click(); document.body.removeChild(link); };

    return (
      <div className="space-y-6">
        {showScanner && <BarcodeScanner onScan={handleSkuScan} onClose={() => setShowScanner(false)} />}
        <div className="flex gap-4 border-b border-gray-300 pb-2 overflow-x-auto">
          <button onClick={() => setActiveTab('products')} className={`pb-2 px-4 font-bold flex gap-2 whitespace-nowrap ${activeTab === 'products' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500'}`}><Package className="w-5 h-5"/> Productos</button>
          <button onClick={() => setActiveTab('technicians')} className={`pb-2 px-4 font-bold flex gap-2 whitespace-nowrap ${activeTab === 'technicians' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500'}`}><Users className="w-5 h-5"/> Técnicos</button>
          <button onClick={() => setActiveTab('invoices')} className={`pb-2 px-4 font-bold flex gap-2 whitespace-nowrap ${activeTab === 'invoices' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-500'}`}><FolderOpen className="w-5 h-5"/> Repositorio Facturas</button>
        </div>
        
        {activeTab === 'products' && (
          <>
            <EditProductModal />
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div className="flex items-center gap-2"><h2 className="text-xl font-bold">Inventario</h2><div className="flex gap-2 ml-4"><button onClick={() => setProductFilter('all')} className={`text-xs px-3 py-1 rounded-full border transition-colors ${productFilter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Todos</button><button onClick={() => setProductFilter('critical')} className={`text-xs px-3 py-1 rounded-full border transition-colors flex items-center gap-1 ${productFilter === 'critical' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-red-500 border-red-200 hover:bg-red-50'}`}><AlertTriangle className="w-3 h-3"/> Críticos</button><button onClick={() => setProductFilter('low')} className={`text-xs px-3 py-1 rounded-full border transition-colors ${productFilter === 'low' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-yellow-600 border-yellow-200 hover:bg-yellow-50'}`}>Bajos</button></div></div>
                <div className="flex gap-2"><Button variant="outline" onClick={handlePrintQRs} disabled={printing} title="Imprimir Etiquetas QR"><Printer className="w-4 h-4"/> Imprimir QR</Button><Button variant="outline" onClick={() => setIsAdding(!isAdding)}>{isAdding ? 'Cancelar' : 'Nuevo'}</Button></div>
            </div>
            {isAdding && (
              <Card className="bg-gray-50">
                <form onSubmit={handleSubmitProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Nombre" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  <div className="mb-2"><label className="block text-sm font-medium text-gray-700 mb-1">SKU / Código</label><div className="flex gap-2"><input className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required /><Button variant="outline" onClick={() => setShowScanner(true)} title="Escanear"><QrCode className="w-5 h-5"/></Button></div></div>
                  <div className="grid grid-cols-3 gap-2 md:col-span-2"><Input type="number" min="0" label="Stock" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required /><Input type="number" min="0" label="Mín" value={formData.min} onChange={e => setFormData({...formData, min: e.target.value})} required /><Input type="number" min="0" label="Crit" value={formData.crit} onChange={e => setFormData({...formData, crit: e.target.value})} required /></div>
                  <Button type="submit" variant="success" className="md:col-span-2 w-full">Guardar</Button>
                </form>
              </Card>
            )}
            <Card className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b"><th className="p-2">SKU</th><th className="p-2">Nombre</th><th className="p-2 text-center">Stock</th><th className="p-2 text-center">Niveles</th><th className="p-2 text-right">Acciones</th></tr></thead><tbody>{filteredProducts.map(p => (<tr key={p.id} className="border-b hover:bg-gray-50"><td className="p-2 font-mono text-xs text-gray-500">{p.sku}</td><td className="p-2 font-medium">{p.name}</td><td className="p-2 text-center font-bold text-lg">{p.stock}</td><td className="p-2 text-center text-xs text-gray-500">Min:{p.min} / Crit:{p.crit}</td><td className="p-2 text-right"><button onClick={() => setEditingProduct(p)} className="text-blue-500 hover:text-blue-700 mr-3"><Edit className="w-4 h-4 inline"/></button><button onClick={() => handleDelete('products', p.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4 inline"/></button></td></tr>))}{filteredProducts.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-400">Sin datos</td></tr>}</tbody></table></Card>
          </>
        )}
        {activeTab === 'technicians' && (
          <>
            <Card className="bg-blue-50 mb-4"><form onSubmit={handleAddTech} className="flex gap-2"><input type="text" placeholder="Nombre Técnico" className="flex-1 p-2 rounded" value={newTechName} onChange={e => setNewTechName(e.target.value)} /><Button type="submit">Agregar</Button></form></Card>
            <Card><table className="w-full text-left"><tbody>{technicians.map(t => (<tr key={t.id} className="border-b"><td className="p-3">{t.name}</td><td className="p-3 text-right"><button onClick={() => handleDelete('technicians', t.id)} className="text-red-500"><Trash2 className="w-4 h-4"/></button></td></tr>))}</tbody></table></Card>
          </>
        )}
        {activeTab === 'invoices' && (
            <>
                <div className="flex justify-end mb-4"><div className="relative w-full md:w-64"><Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" /><input type="text" placeholder="Buscar Nº Factura..." className="w-full pl-9 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" value={invoiceSearchTerm} onChange={(e) => setInvoiceSearchTerm(e.target.value)}/></div></div>
                <Card><InvoiceDetailModal /><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-100 text-gray-600"><tr><th className="p-3">Fecha Registro</th><th className="p-3">Tipo</th><th className="p-3">Referencia</th><th className="p-3 text-center">Items</th><th className="p-3 text-right">Acciones</th></tr></thead>
                <tbody className="divide-y">{filteredInvoices.map((inv, idx) => (
                    <tr key={idx} onClick={() => setViewInvoice(inv)} className="hover:bg-blue-50 cursor-pointer transition-colors">
                        <td className="p-3">{new Date(inv.date).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(inv.date).toLocaleTimeString()}</span></td>
                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${inv.type === 'Ingreso Bodega' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>{inv.type}</span></td>
                        <td className="p-3 font-mono font-bold text-gray-700">{inv.ref}</td>
                        <td className="p-3 text-center">{inv.total}</td>
                        <td className="p-3 text-right flex justify-end gap-2">{inv.file && (<button onClick={(e) => { e.stopPropagation(); downloadPdf(inv.file, inv.name); }} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50 transition-colors"><Download className="w-3 h-3"/> PDF</button>)}<button onClick={(e) => { e.stopPropagation(); handleDelete('invoices', inv.id); }} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4"/></button></td>
                    </tr>
                ))}{filteredInvoices.length === 0 && (<tr><td colSpan="5" className="p-8 text-center text-gray-400">No se encontraron facturas</td></tr>)}</tbody></table></div></Card>
            </>
        )}
      </div>
    );
};

// --- REPORTS VIEW (BITÁCORA DIARIA) ---
const ReportsView = ({ transactions }) => {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); 
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);    
    
    // Filtro corregido por string YYYY-MM-DD para evitar problemas de zona horaria
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => { 
            const tDate = t.date ? t.date.split('T')[0] : '';
            return tDate >= startDate && tDate <= endDate;
        });
    }, [transactions, startDate, endDate]);

    const stats = useMemo(() => {
        const byTech = {}; 
        const byProduct = {}; 
        
        filteredTransactions.forEach(t => {
            if (t.type === 'out') {
                const qty = Number(t.qty) || 0;
                // Agrupar por Técnico
                if (t.technician) { 
                    if (!byTech[t.technician]) byTech[t.technician] = {}; 
                    byTech[t.technician][t.productName] = (byTech[t.technician][t.productName] || 0) + qty; 
                }
                // Agrupar por Producto
                byProduct[t.productName] = (byProduct[t.productName] || 0) + qty;
            }
        });
        
        return { 
            techData: byTech, 
            prodData: Object.entries(byProduct)
                .map(([name, qty]) => ({ name, qty }))
                .sort((a,b) => b.qty - a.qty)
                .slice(0, 10) 
        };
    }, [filteredTransactions]);

    const exportToCSV = () => {
        if (filteredTransactions.length === 0) { alert("No hay datos"); return; }
        let csvContent = "Fecha,Hora,Tipo,Producto,Cantidad,Tecnico,Factura Ref\n";
        filteredTransactions.forEach(t => { 
            const dateObj = new Date(t.date); 
            csvContent += [
                dateObj.toLocaleDateString(), 
                dateObj.toLocaleTimeString(), 
                t.type === 'in' ? 'Ingreso' : (t.type === 'out' ? 'Salida' : 'Devolucion'), 
                `"${t.productName}"`, 
                t.qty, 
                t.technician || 'N/A', 
                t.invoiceRef || 'N/A'
            ].join(",") + "\n"; 
        });
        const link = document.createElement("a"); 
        link.href = URL.createObjectURL(new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })); 
        link.setAttribute("download", `reporte_${startDate}_${endDate}.csv`); 
        document.body.appendChild(link); 
        link.click();
    };

    return (
        <div className="space-y-6">
            <Card className="bg-slate-800 text-white">
                <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-1"><BarChart3 className="text-blue-400"/> Reportes de Consumo</h2>
                        <p className="text-xs text-gray-400">Selecciona un rango de fechas para ver el consumo</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                        <div><label className="block text-xs text-gray-400 mb-1">Desde</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-slate-700 border-slate-600 rounded p-2 text-sm w-full outline-none focus:border-blue-500" /></div>
                        <div><label className="block text-xs text-gray-400 mb-1">Hasta</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-slate-700 border-slate-600 rounded p-2 text-sm w-full outline-none focus:border-blue-500" /></div>
                        <div className="flex items-end"><button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 w-full justify-center md:w-auto"><FileText className="w-4 h-4"/> CSV</button></div>
                    </div>
                </div>
            </Card>
            
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-700 border-b pb-2">Consumo Detallado por Técnico</h3>
                {Object.keys(stats.techData).length === 0 ? (
                    <div className="text-center py-10 text-gray-400 bg-white rounded shadow border border-dashed">
                        No hay retiros registrados en este periodo.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(stats.techData).map(([techName, products]) => (
                            <Card key={techName} className="border-t-4 border-blue-500">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="bg-blue-100 p-2 rounded-full"><Users className="w-5 h-5 text-blue-600"/></div>
                                    <h4 className="font-bold text-gray-800">{techName}</h4>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                            <tr>
                                                <th className="text-left py-1">Material</th>
                                                <th className="text-right py-1">Cant.</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {Object.entries(products).sort((a,b) => b[1] - a[1]).map(([prod, qty]) => (
                                                <tr key={prod}>
                                                    <td className="py-1 text-gray-700">{prod}</td>
                                                    <td className="py-1 text-right font-bold text-gray-900">{qty}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- HARDWARE VIEW (MÓDULO FERRETERÍA) ---
const HardwareView = ({ technicians, showMessage }) => {
    const [items, setItems] = useState([]);
    const [cart, setCart] = useState([]); // CARRITO DE FERRETERÍA
    const [mode, setMode] = useState('out'); // 'in' (ingreso) | 'out' (retiro)
    const [selectedTech, setSelectedTech] = useState('');
    const [comment, setComment] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const u1 = onSnapshot(collection(db, "hardware_items"), (s) => setItems(s.docs.map(d => ({id: d.id, ...d.data()}))));
        return () => u1();
    }, []);

    const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const addToCart = (item) => {
        setCart(prev => {
            const exists = prev.find(i => i.id === item.id);
            if(exists) return prev.map(i => i.id === item.id ? {...i, qty: i.qty + 1} : i);
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const removeFromCart = (index) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const updateQty = (index, delta) => {
        setCart(prev => prev.map((item, i) => {
            if(i === index) return { ...item, qty: Math.max(1, item.qty + delta) };
            return item;
        }));
    };

    const handleCreateItem = async () => {
        // En lugar de prompt, usamos el buscador
        if(!searchTerm.trim()) { alert("Escribe el nombre del material en el buscador primero."); return; }
        const name = searchTerm.trim();
        const exists = items.find(i => i.name.toLowerCase() === name.toLowerCase());
        if(exists) { alert("Este material ya existe"); return; }
        
        try {
            await addDoc(collection(db, "hardware_items"), { name, stock: 0 });
            showMessage(`Creado: ${name}`);
            setSearchTerm('');
        } catch(e) { alert("Error al crear"); }
    };

    const processCart = async () => {
        if(cart.length === 0) return;
        if(mode === 'out' && (!selectedTech || !comment)) { alert("Debes indicar Técnico y Comentario"); return; }
        if(mode === 'in' && !comment) { alert("Debes indicar Proveedor o Factura en el comentario"); return; }

        try {
            const promises = cart.map(async (item) => {
                const docRef = doc(db, "hardware_items", item.id);
                // Validar Stock
                if(mode === 'out' && item.stock < item.qty) throw new Error(`Stock insuficiente: ${item.name}`);
                
                const newStock = mode === 'in' ? item.stock + item.qty : item.stock - item.qty;
                await updateDoc(docRef, { stock: newStock });
                
                await addDoc(collection(db, "hardware_transactions"), {
                    itemName: item.name,
                    type: mode,
                    qty: item.qty,
                    user: mode === 'out' ? selectedTech : 'Bodega',
                    comment: comment || '',
                    date: new Date().toISOString()
                });
            });

            await Promise.all(promises);
            showMessage("Transacción de ferretería exitosa");
            setCart([]); setComment(''); setSelectedTech('');
        } catch (e) { alert(e.message); }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
            {/* IZQUIERDA: CATÁLOGO */}
            <div className="w-full md:w-1/2 flex flex-col gap-4">
                <Card className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold flex items-center gap-2"><Hammer className="w-5 h-5 text-amber-600"/> Catálogo</h3>
                    </div>
                    <div className="relative mb-2 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4"/>
                            <input className="w-full pl-9 p-2 border rounded" placeholder="Buscar material..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                        </div>
                        {searchTerm && filteredItems.length === 0 && (
                            <button onClick={handleCreateItem} className="bg-green-600 text-white px-3 rounded font-bold text-xs hover:bg-green-700 whitespace-nowrap">
                                CREAR "{searchTerm}"
                            </button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {filteredItems.map(item => (
                            <div key={item.id} onClick={() => addToCart(item)} className="p-3 border rounded hover:bg-gray-50 cursor-pointer flex justify-between select-none">
                                <span className="font-medium">{item.name}</span>
                                <span className="font-bold bg-gray-100 px-2 rounded">Stock: {item.stock}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* DERECHA: CARRITO */}
            <div className="w-full md:w-1/2 flex flex-col gap-4">
                <Card className="h-full flex flex-col">
                    <div className="flex gap-2 mb-4 border-b pb-4">
                        <button onClick={() => setMode('out')} className={`flex-1 py-2 rounded font-bold ${mode === 'out' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>RETIRO</button>
                        <button onClick={() => setMode('in')} className={`flex-1 py-2 rounded font-bold ${mode === 'in' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>INGRESO</button>
                    </div>

                    <div className="space-y-3 mb-4">
                        {mode === 'out' ? (
                            <>
                                <select className="w-full p-2 border rounded" value={selectedTech} onChange={e => setSelectedTech(e.target.value)}>
                                    <option value="">-- Seleccionar Técnico --</option>
                                    {technicians.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                </select>
                                <input className="w-full p-2 border rounded" placeholder="Comentario / Destino..." value={comment} onChange={e => setComment(e.target.value)} />
                            </>
                        ) : (
                            <input className="w-full p-2 border rounded" placeholder="Proveedor / Nº Factura / Origen..." value={comment} onChange={e => setComment(e.target.value)} />
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 mb-4 bg-gray-50 p-2 rounded">
                        {cart.length === 0 && <p className="text-center text-gray-400 py-10">Carrito vacío</p>}
                        {cart.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                                <span className="text-sm font-medium truncate w-1/3">{item.name}</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQty(i, -1)} className="p-1 bg-gray-100 border rounded"><Minus className="w-3 h-3"/></button>
                                    <span className="font-bold w-8 text-center">{item.qty}</span>
                                    <button onClick={() => updateQty(i, 1)} className="p-1 bg-gray-100 border rounded"><Plus className="w-3 h-3"/></button>
                                </div>
                                <button onClick={() => removeFromCart(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>

                    <Button onClick={processCart} variant={mode === 'in' ? 'success' : 'primary'} disabled={cart.length === 0} className="w-full py-4 text-lg">
                        Confirmar {mode === 'in' ? 'Ingreso' : 'Retiro'} ({cart.length} items)
                    </Button>
                </Card>
            </div>
        </div>
    );
};

// --- ANTENAS VIEW (MÓDULO ANTENAS) ---
const AntenasView = ({ technicians, showMessage }) => {
    const [antennas, setAntennas] = useState([]);
    const [activeTab, setActiveTab] = useState('stock'); // 'stock', 'assign', 'return'
    const [search, setSearch] = useState('');
    
    // Forms
    const [newAntenna, setNewAntenna] = useState({ mac: '', serial: '', model: '' });
    const [assignData, setAssignData] = useState({ antennaId: '', tech: '' });

    useEffect(() => {
        const u1 = onSnapshot(collection(db, "antennas"), (s) => setAntennas(s.docs.map(d => ({id: d.id, ...d.data()}))));
        return () => { u1(); };
    }, []);

    // 1. INGRESAR NUEVA ANTENA
    const handleAdd = async (e) => {
        e.preventDefault();
        if(!newAntenna.mac || !newAntenna.serial) return;
        try {
            await addDoc(collection(db, "antennas"), { ...newAntenna, status: 'DISPONIBLE', location: 'Bodega' });
            await addDoc(collection(db, "antenna_transactions"), { type: 'INGRESO', ...newAntenna, user: 'Bodega', date: new Date().toISOString() });
            setNewAntenna({ mac: '', serial: '', model: '' }); showMessage("Antena registrada");
        } catch (e) { alert(e.message); }
    };

    // 2. ASIGNAR A TÉCNICO
    const handleAssign = async (e) => {
        e.preventDefault();
        if(!assignData.antennaId || !assignData.tech) return;
        try {
            const ant = antennas.find(a => a.id === assignData.antennaId);
            await updateDoc(doc(db, "antennas", assignData.antennaId), { status: 'ASIGNADA', location: assignData.tech });
            await addDoc(collection(db, "antenna_transactions"), { type: 'ASIGNACION', mac: ant.mac, serial: ant.serial, user: assignData.tech, date: new Date().toISOString() });
            setAssignData({ antennaId: '', tech: '' }); showMessage("Antena asignada");
        } catch (e) { alert(e.message); }
    };

    // 3. RECUPERAR (DEVOLUCIÓN A BODEGA)
    const handleReturn = async (antennaId) => {
        if(!window.confirm("¿Confirmar reingreso a bodega?")) return;
        try {
            const ant = antennas.find(a => a.id === antennaId);
            await updateDoc(doc(db, "antennas", antennaId), { status: 'DISPONIBLE', location: 'Bodega' });
            await addDoc(collection(db, "antenna_transactions"), { type: 'RECUPERACION', mac: ant.mac, serial: ant.serial, user: 'Bodega', date: new Date().toISOString() });
            showMessage("Antena recuperada");
        } catch (e) { alert(e.message); }
    };

    const filteredAntennas = antennas.filter(a => a.mac.toLowerCase().includes(search.toLowerCase()) || a.serial.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex flex-col gap-6 h-full">
            <Card>
                <div className="flex gap-4 border-b pb-4 mb-4">
                    <button onClick={() => setActiveTab('stock')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'stock' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Stock Bodega</button>
                    <button onClick={() => setActiveTab('assign')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'assign' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Asignar a Técnico</button>
                    <button onClick={() => setActiveTab('return')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'return' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>Recuperar / Reingreso</button>
                </div>

                {/* VISTA 1: STOCK / INGRESO */}
                {activeTab === 'stock' && (
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                            <h3 className="font-bold mb-2">Nueva Antena</h3>
                            <form onSubmit={handleAdd} className="space-y-2 bg-gray-50 p-4 rounded border">
                                <input className="w-full border p-2 rounded" placeholder="Modelo" value={newAntenna.model} onChange={e => setNewAntenna({...newAntenna, model: e.target.value})} required/>
                                <input className="w-full border p-2 rounded" placeholder="MAC Address" value={newAntenna.mac} onChange={e => setNewAntenna({...newAntenna, mac: e.target.value})} required/>
                                <input className="w-full border p-2 rounded" placeholder="Nº Serie" value={newAntenna.serial} onChange={e => setNewAntenna({...newAntenna, serial: e.target.value})} required/>
                                <Button type="submit" className="w-full">Guardar</Button>
                            </form>
                        </div>
                        <div className="md:w-2/3">
                            <h3 className="font-bold mb-2">Disponibles en Bodega</h3>
                            <div className="h-64 overflow-y-auto border rounded">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100"><tr><th className="p-2 text-left">Modelo</th><th className="p-2 text-left">MAC</th><th className="p-2 text-left">Serie</th></tr></thead>
                                    <tbody>
                                        {antennas.filter(a => a.status === 'DISPONIBLE').map(a => (
                                            <tr key={a.id} className="border-b"><td className="p-2">{a.model}</td><td className="p-2 font-mono">{a.mac}</td><td className="p-2 font-mono">{a.serial}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* VISTA 2: ASIGNAR */}
                {activeTab === 'assign' && (
                    <div className="max-w-xl mx-auto">
                        <h3 className="font-bold mb-4 text-center">Entregar Antena a Técnico</h3>
                        <form onSubmit={handleAssign} className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <div>
                                <label className="block text-sm font-bold mb-1">Seleccionar Antena (Disponible)</label>
                                <select className="w-full border p-2 rounded bg-white" value={assignData.antennaId} onChange={e => setAssignData({...assignData, antennaId: e.target.value})} required>
                                    <option value="">-- Seleccionar --</option>
                                    {antennas.filter(a => a.status === 'DISPONIBLE').map(a => <option key={a.id} value={a.id}>{a.model} - {a.mac}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Técnico Receptor</label>
                                <select className="w-full border p-2 rounded bg-white" value={assignData.tech} onChange={e => setAssignData({...assignData, tech: e.target.value})} required>
                                    <option value="">-- Seleccionar --</option>
                                    {technicians.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                </select>
                            </div>
                            <Button type="submit" className="w-full py-3">Confirmar Entrega</Button>
                        </form>
                    </div>
                )}

                {/* VISTA 3: RECUPERAR */}
                {activeTab === 'return' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">Antenas en Terreno (Asignadas)</h3>
                            <input className="border p-2 rounded w-64 text-sm" placeholder="Buscar MAC / Serie..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="h-96 overflow-y-auto border rounded">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2 text-left">Modelo</th>
                                        <th className="p-2 text-left">MAC</th>
                                        <th className="p-2 text-left">Técnico Actual</th>
                                        <th className="p-2 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAntennas.filter(a => a.status === 'ASIGNADA').map(a => (
                                        <tr key={a.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2">{a.model}</td>
                                            <td className="p-2 font-mono">{a.mac}</td>
                                            <td className="p-2 font-bold text-blue-600">{a.location}</td>
                                            <td className="p-2 text-right">
                                                <button onClick={() => handleReturn(a.id)} className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 font-bold text-xs">REINGRESAR</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

// --- DASHBOARD SIMPLIFICADO CON ALERTA Y BUSCADOR ---
const DashboardView = ({ products }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const inventoryHealth = useMemo(() => {
        let critical = 0;
        products.forEach(p => { if (p.stock <= p.crit) critical++; });
        return [{ value: critical }];
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    return (
        <div className="space-y-6">
            {/* ALERTA ROJA */}
            {inventoryHealth[0].value > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-red-600 w-6 h-6" />
                        <div>
                            <p className="font-bold text-red-800 text-lg">¡Atención! {inventoryHealth[0].value} productos en nivel crítico</p>
                            <p className="text-red-600 text-sm">Se requiere reabastecimiento inmediato.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* TABLA / LISTADO */}
            <Card>
                <div className="flex flex-col md:flex-row justify-between mb-4 items-center gap-4">
                    <h2 className="font-bold text-gray-700">Listado General de Bodega</h2>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4"/>
                        <input 
                            className="w-full pl-9 p-2 border rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="Buscar producto..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto max-h-[calc(100vh-250px)]"> 
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                            <tr className="border-b">
                                <th className="p-3">Producto</th>
                                <th className="p-3 text-center">Stock</th>
                                <th className="p-3 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredProducts.map(p => { 
                                let statusColor = "bg-green-100 text-green-800";
                                let statusLabel = "OK";
                                if (p.stock <= p.crit) { statusColor = "bg-red-100 text-red-800"; statusLabel = "Crítico"; }
                                else if (p.stock <= p.min) { statusColor = "bg-yellow-100 text-yellow-800"; statusLabel = "Bajo"; }
                                
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3">
                                            <div className="font-medium text-gray-800">{p.name}</div>
                                            <div className="text-xs text-gray-400 font-mono">{p.sku}</div>
                                        </td>
                                        <td className="p-3 text-center font-bold text-base">{p.stock}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor}`}>{statusLabel}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// --- APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null); 
  const [view, setView] = useState('dashboard');
  const [dbTab, setDbTab] = useState('products'); 
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [invoices, setInvoices] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isRestricted, setIsRestricted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
    
  const [cart, setCart] = useState([]);
  const [technician, setTechnician] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceFileBase64, setInvoiceFileBase64] = useState(null);
  const [invoiceFileName, setInvoiceFileName] = useState('');

  useEffect(() => { document.title = "Bodega Telconor"; }, []);
  const showMessage = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'salida') { setIsRestricted(true); setView('salida'); } 
    else if (mode === 'devolucion') { setIsRestricted(true); setView('devolucion'); } 
    else if (mode === 'monitor') { setIsRestricted(true); setView('dashboard'); }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => { setUser(currentUser); setLoading(false); });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user && !isRestricted) return; 
    const u1 = onSnapshot(query(collection(db, "products"), orderBy("name")), (s) => setProducts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(query(collection(db, "transactions"), orderBy("date", "desc")), (s) => setTransactions(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u3 = onSnapshot(query(collection(db, "technicians"), orderBy("name")), (s) => setTechnicians(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u4 = onSnapshot(query(collection(db, "invoices"), orderBy("date", "desc")), (s) => setInvoices(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); u3(); u4(); };
  }, [user, isRestricted]);

  const initiateAddToCart = (skuOrId) => {
    if(!skuOrId) return;
    const product = products.find(p => p.sku === skuOrId || p.sku.toLowerCase() === skuOrId.toLowerCase() || p.id === skuOrId);
    if (!product) { showMessage("❌ Producto no encontrado"); return; }
    setSelectedProduct(product);
  };
  const confirmAddToCart = (product, qty) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item);
      return [...prev, { ...product, qty: qty }];
    });
    setSelectedProduct(null);
  };
  const incrementCartItem = (id) => {
    setCart(prev => prev.map(item => { if (item.id === id) { if (view === 'salida' && item.qty >= item.stock) { showMessage("⚠️ Stock máximo alcanzado"); return item; } return { ...item, qty: item.qty + 1 }; } return item; }));
  };
  const decrementCartItem = (id) => setCart(prev => prev.map(item => { if (item.id === id) { return { ...item, qty: Math.max(1, item.qty - 1) }; } return item; }));
  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

  const processTransaction = async (type) => {
    if (cart.length === 0) return;
    if ((type === 'out' || type === 'return') && !technician) { showMessage("⚠️ Debe asignar un técnico"); return; }
    if (type === 'in' && !invoiceNumber) { showMessage("⚠️ Debe ingresar el Número de Factura"); return; }
    try {
      if (type === 'in') { await addDoc(collection(db, "invoices"), { number: invoiceNumber, file: invoiceFileBase64, fileName: invoiceFileName, date: new Date().toISOString(), items: cart, totalItems: cart.reduce((acc, curr) => acc + curr.qty, 0) }); }
      const batchPromises = cart.map(async (item) => {
        const productRef = doc(db, "products", item.id);
        const currentProd = products.find(p => p.id === item.id);
        if (!currentProd) return;
        if (type === 'out' && currentProd.stock < item.qty) throw new Error(`Stock insuficiente para ${item.name}`);
        let newStock = currentProd.stock;
        if (type === 'in' || type === 'return') newStock += item.qty;
        else if (type === 'out') newStock -= item.qty;
        await updateDoc(productRef, { stock: newStock });
        await addDoc(collection(db, "transactions"), { productId: item.id, productName: item.name, type, qty: item.qty, technician: (type === 'out' || type === 'return') ? technician : 'Bodega', invoiceRef: type === 'in' ? invoiceNumber : '', date: new Date().toISOString() });
      });
      await Promise.all(batchPromises);
      setCart([]); setTechnician(''); setInvoiceNumber(''); setInvoiceFileBase64(null); setInvoiceFileName(''); showMessage(type === 'return' ? "✅ Material devuelto correctamente" : "✅ Transacción exitosa");
    } catch (error) { showMessage("❌ Error: " + error.message); }
  };

  const handleInvoiceFile = (e) => { const file = e.target.files[0]; if (file) { if (file.size > 1000000) { alert("⚠️ Archivo muy grande (>1MB)"); return; } setInvoiceFileName(file.name); const reader = new FileReader(); reader.onloadend = () => setInvoiceFileBase64(reader.result); reader.readAsDataURL(file); } };
  const downloadPdf = (base64, name) => { const link = document.createElement("a"); link.href = base64; link.download = name || "documento.pdf"; document.body.appendChild(link); link.click(); document.body.removeChild(link); };
  const handleRedirectToInvoices = () => { setDbTab('invoices'); setView('db'); };

  if (loading) return <div className="h-screen flex items-center justify-center animate-pulse text-blue-600 font-bold bg-slate-900">Cargando sistema...</div>;
  if (!user && !isRestricted) return <LoginView />;

  const commonTransactionProps = { products, cart, technicians, technician, setTechnician, invoiceNumber, setInvoiceNumber, invoiceFileName, handleInvoiceFile, initiateAddToCart, removeFromCart, processTransaction, invoices, downloadPdf, incrementCartItem, decrementCartItem, isRestricted, showMessage };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden relative">
      <Notification message={notification} onClose={() => setNotification(null)} />
      {selectedProduct && (<QuantityModal product={selectedProduct} type={view === 'ingreso' ? 'in' : (view === 'devolucion' ? 'return' : 'out')} currentCartQty={cart.find(c => c.id === selectedProduct.id)?.qty || 0} onClose={() => setSelectedProduct(null)} onConfirm={confirmAddToCart}/>)}

      {isMenuOpen && (<div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" />)}

      {!isRestricted && (
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex md:flex-col`}>
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700 w-full mb-4">
            <div className="flex items-center"><Database className="w-8 h-8 text-blue-400" /><span className="ml-3 font-bold text-xl">Bodega</span></div>
            <button onClick={() => setIsMenuOpen(false)} className="md:hidden text-gray-400 hover:text-white"><X className="w-6 h-6"/></button>
          </div>
          <nav className="flex-1 flex flex-col w-full px-2 space-y-2 overflow-y-auto">
            {[
              { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard }, 
              { id: 'ingreso', label: 'Ingresos', icon: ArrowDownToLine }, 
              { id: 'salida', label: 'Salidas', icon: ArrowUpFromLine }, 
              { id: 'devolucion', label: 'Devoluciones', icon: RotateCcw }, 
              { id: 'antenas', label: 'Antenas', icon: Wifi }, 
              { id: 'ferreteria', label: 'Ferretería', icon: Hammer }, 
              { id: 'db', label: 'Base de Datos', icon: Database }, 
              { id: 'reportes', label: 'Reportes', icon: BarChart3 }
            ].map(i => (
              <button key={i.id} onClick={() => { setView(i.id); setIsMenuOpen(false); }} className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 text-left ${view === i.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <i.icon className="w-5 h-5 flex-shrink-0" /><span className="ml-3 font-medium text-sm">{i.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-700"><button onClick={() => signOut(auth)} className="flex items-center text-slate-400 hover:text-white transition-colors w-full p-2 hover:bg-slate-800 rounded"><LogOut className="w-5 h-5 mr-2" /> Salir</button></div>
        </aside>
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="flex justify-between items-center p-4 md:p-8 bg-white md:bg-transparent border-b md:border-none shadow-sm md:shadow-none flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            {!isRestricted && (<button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"><Menu className="w-6 h-6" /></button>)}
            <h1 className="text-xl md:text-3xl font-bold text-gray-800 capitalize truncate flex items-center gap-2">{isRestricted && <ShieldCheck className="text-green-600"/>}{isRestricted ? (view === 'devolucion' ? 'Kiosco de Devoluciones' : view === 'salida' ? 'Kiosco de Salidas' : 'Monitor de Inventario') : (view === 'db' ? 'Base de Datos' : view === 'ferreteria' ? 'Ferretería' : view === 'antenas' ? 'Gestión de Antenas' : view)}</h1>
          </div>
          <div className="text-right hidden md:block"><p className="text-sm font-bold text-blue-600 whitespace-nowrap">{new Date().toLocaleDateString()}</p>{!isRestricted && <p className="text-xs text-gray-400">{user?.email}</p>}</div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {isRestricted && view === 'salida' && (<TransactionView type="out" {...commonTransactionProps} />)}
          {isRestricted && view === 'devolucion' && (<TransactionView type="return" {...commonTransactionProps} />)}
          {/* MODO MONITOR */}
          {isRestricted && view === 'dashboard' && (<DashboardView products={products} />)}
          {!isRestricted && (
            <>
                {view === 'dashboard' && <DashboardView products={products} />} 
                {view === 'ingreso' && <TransactionView type="in" {...commonTransactionProps} onRedirectToRepo={handleRedirectToInvoices} />}
                {view === 'salida' && <TransactionView type="out" {...commonTransactionProps} />}
                {view === 'devolucion' && <TransactionView type="return" {...commonTransactionProps} />}
                {view === 'ferreteria' && <HardwareView technicians={technicians} showMessage={showMessage} />}
                {view === 'antenas' && <AntenasView technicians={technicians} showMessage={showMessage} />}
                {view === 'db' && <DatabaseView activeTab={dbTab} setActiveTab={setDbTab} showMessage={showMessage} user={user} />}
                {view === 'reportes' && <ReportsView transactions={transactions} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}