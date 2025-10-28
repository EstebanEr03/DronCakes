// Configuración de la API
const API_BASE = window.location.origin;
const API_ENDPOINTS = {
    orders: `${API_BASE}/api/orders`,
    drones: `${API_BASE}/api/drones`
};

// Estado de la aplicación
let currentOrders = [];
let currentDrones = [];

// Elementos del DOM
const orderForm = document.getElementById('orderForm');
const dronesContainer = document.getElementById('dronesContainer');
const ordersContainer = document.getElementById('ordersContainer');
const refreshDronesBtn = document.getElementById('refreshDrones');
const refreshOrdersBtn = document.getElementById('refreshOrders');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modalMessage');
const closeModal = document.querySelector('.close');

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
orderForm.addEventListener('submit', handleOrderSubmit);
refreshDronesBtn.addEventListener('click', loadDrones);
refreshOrdersBtn.addEventListener('click', loadOrders);
closeModal.addEventListener('click', hideModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
});

// Inicialización de la aplicación
async function initializeApp() {
    console.log('🚁 Iniciando DronCakes...');
    await Promise.all([loadDrones(), loadOrders()]);
    
    // Auto-refresh cada 30 segundos
    setInterval(() => {
        loadDrones();
        loadOrders();
    }, 30000);
}

// Manejo del formulario de órdenes
async function handleOrderSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(orderForm);
    const orderData = {
        customer: formData.get('customer').trim(),
        flavor: formData.get('flavor')
    };

    // Validación
    if (!orderData.customer || !orderData.flavor) {
        showModal('❌ Error', 'Por favor completa todos los campos', 'error');
        return;
    }

    try {
        showLoadingState('Creando orden...');
        
        const response = await fetch(API_ENDPOINTS.orders, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok) {
            showModal(
                '✅ ¡Orden Creada!', 
                `Orden #${result.id} para ${result.customer} (${result.flavor}) asignada al dron ${result.drone}. Estado: ${result.status}`,
                'success'
            );
            orderForm.reset();
            await Promise.all([loadDrones(), loadOrders()]);
        } else {
            throw new Error(result.error || 'Error al crear la orden');
        }
    } catch (error) {
        console.error('Error al crear orden:', error);
        showModal('❌ Error', error.message, 'error');
    }
}

// Cargar drones
async function loadDrones() {
    try {
        const response = await fetch(API_ENDPOINTS.drones);
        
        if (!response.ok) {
            throw new Error('Error al cargar drones');
        }
        
        currentDrones = await response.json();
        renderDrones();
    } catch (error) {
        console.error('Error al cargar drones:', error);
        dronesContainer.innerHTML = `
            <div class="error-message">
                ❌ Error al cargar drones: ${error.message}
            </div>
        `;
    }
}

// Cargar órdenes
async function loadOrders() {
    try {
        const response = await fetch(API_ENDPOINTS.orders);
        
        if (!response.ok) {
            throw new Error('Error al cargar órdenes');
        }
        
        currentOrders = await response.json();
        renderOrders();
    } catch (error) {
        console.error('Error al cargar órdenes:', error);
        ordersContainer.innerHTML = `
            <div class="error-message">
                ❌ Error al cargar órdenes: ${error.message}
            </div>
        `;
    }
}

// Renderizar drones
function renderDrones() {
    if (!currentDrones || currentDrones.length === 0) {
        dronesContainer.innerHTML = `
            <div class="empty-state">
                🚁 No hay drones disponibles
            </div>
        `;
        return;
    }

    const dronesHTML = currentDrones.map(drone => `
        <div class="drone-item ${drone.available ? '' : 'busy'}">
            <div>
                <div class="drone-name">${drone.name}</div>
                <div class="drone-id">ID: ${drone.id}</div>
            </div>
            <div>
                <span class="drone-status ${drone.available ? 'status-available' : 'status-busy'}">
                    ${drone.available ? '✅ Disponible' : '🚁 En vuelo'}
                </span>
                <div class="drone-controls">
                    <button class="btn-primary btn-small" onclick="toggleDroneStatus(${drone.id}, ${!drone.available})">
                        ${drone.available ? '🚀 Enviar' : '🏠 Regresar'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    dronesContainer.innerHTML = dronesHTML;
}

// Renderizar órdenes
function renderOrders() {
    if (!currentOrders || currentOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                📋 No hay órdenes activas
            </div>
        `;
        return;
    }

    const ordersHTML = currentOrders.map(order => `
        <div class="order-item ${order.status === 'entregado' ? 'order-completed' : ''}">
            <div class="order-header">
                <div class="order-id">Orden #${order.id}</div>
                <div class="order-status ${getStatusClass(order.status)}">${getStatusIcon(order.status)} ${order.status}</div>
            </div>
            <div class="order-details">
                <strong>Cliente:</strong> ${order.customer}<br>
                <strong>Sabor:</strong> ${getFlavorEmoji(order.flavor)} ${order.flavor}<br>
                <strong>Dron asignado:</strong> ${order.drone}<br>
                ${order.createdAt ? `<strong>Creado:</strong> ${formatDate(order.createdAt)}<br>` : ''}
                ${order.estimatedDelivery ? `<strong>Entrega estimada:</strong> ${formatDate(order.estimatedDelivery)}<br>` : ''}
                ${order.deliveredAt ? `<strong>Entregado:</strong> ${formatDate(order.deliveredAt)}<br>` : ''}
            </div>
            <div class="order-controls">
                ${order.status !== 'entregado' ? `
                    <button class="btn-primary btn-small" onclick="completeOrderManually(${order.id})">
                        ✅ Marcar como Entregado
                    </button>
                ` : ''}
                ${order.status === 'entregado' ? `
                    <span class="completed-badge">🎉 ¡Entregado!</span>
                ` : ''}
            </div>
        </div>
    `).join('');

    ordersContainer.innerHTML = ordersHTML;
}

// Cambiar estado de dron
window.toggleDroneStatus = async function(droneId, newStatus) {
    try {
        console.log(`Cambiando estado del dron ${droneId} a ${newStatus}`);
        showLoadingState('Actualizando dron...');
        
        const response = await fetch(`${API_ENDPOINTS.drones}/${droneId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ available: newStatus })
        });

        const result = await response.json();
        console.log('Resultado dron:', result);

        if (response.ok) {
            showModal(
                '✅ Dron Actualizado', 
                result.message,
                'success'
            );
            await loadDrones();
        } else {
            throw new Error(result.error || 'Error al actualizar dron');
        }
    } catch (error) {
        console.error('Error al actualizar dron:', error);
        showModal('❌ Error', error.message, 'error');
    }
}

// Mostrar modal
function showModal(title, message, type = 'info') {
    const iconMap = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    modalMessage.innerHTML = `
        <h3>${iconMap[type] || iconMap.info} ${title}</h3>
        <p>${message}</p>
    `;
    
    modal.style.display = 'block';
    
    // Auto-cerrar después de 5 segundos para mensajes de éxito
    if (type === 'success') {
        setTimeout(hideModal, 5000);
    }
}

// Ocultar modal
function hideModal() {
    modal.style.display = 'none';
}

// Mostrar estado de carga
function showLoadingState(message) {
    showModal('⏳ Cargando...', message, 'info');
}

// Completar orden manualmente
window.completeOrderManually = async function(orderId) {
    try {
        console.log(`Completando orden ${orderId} manualmente`);
        showLoadingState('Marcando orden como entregada...');
        
        const response = await fetch(`${API_ENDPOINTS.orders}/${orderId}/complete`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        console.log('Resultado:', result);

        if (response.ok) {
            showModal(
                '✅ Orden Completada', 
                `${result.message}. El dron ${result.order.drone} ya está disponible para nuevas órdenes.`,
                'success'
            );
            await Promise.all([loadDrones(), loadOrders()]);
        } else {
            throw new Error(result.error || 'Error al completar la orden');
        }
    } catch (error) {
        console.error('Error al completar orden:', error);
        showModal('❌ Error', error.message, 'error');
    }
}

// Utilidades
function formatDate(dateString) {
    return new Date(dateString).toLocaleString('es-ES');
}

function getFlavorEmoji(flavor) {
    const emojiMap = {
        'chocolate': '🍫',
        'vainilla': '🍦',
        'fresa': '🍓',
        'red-velvet': '❤️',
        'tres-leches': '🥛',
        'zanahoria': '🥕'
    };
    
    return emojiMap[flavor] || '🧁';
}

function getStatusIcon(status) {
    const iconMap = {
        'preparando': '👩‍🍳',
        'en vuelo': '🚁',
        'entregado': '✅'
    };
    
    return iconMap[status] || '📦';
}

function getStatusClass(status) {
    const classMap = {
        'preparando': 'status-preparing',
        'en vuelo': 'status-flying',
        'entregado': 'status-delivered'
    };
    
    return classMap[status] || 'status-default';
}

// Manejo de errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
    showModal('❌ Error', 'Ha ocurrido un error inesperado', 'error');
});

// Manejo de errores de red
window.addEventListener('unhandledrejection', (e) => {
    console.error('Error de promesa no manejado:', e.reason);
    showModal('❌ Error de Red', 'Problema de conexión con el servidor', 'error');
});

console.log('🚁 DronCakes JavaScript cargado correctamente');