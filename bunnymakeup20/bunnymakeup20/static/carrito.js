function mostrarCarrito() {
    const carritoContenido = document.getElementById('carrito-contenido');
    carritoContenido.innerHTML = '';

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let totalGeneral = 0;

    if (carrito.length === 0) {
        carritoContenido.innerHTML = '<p>El carrito está vacío.</p>';
    } else {
        carrito.forEach((item, index) => {
            const subtotal = item.cantidad * item.precio;
            totalGeneral += subtotal;

            const productoElement = document.createElement('div');
            productoElement.classList.add('producto-item');
            productoElement.innerHTML = `
                <div class="producto-info">
                    <div class="producto-imagen">
                        <img src="${item.imagen}" alt="${item.nombre}" width="80">
                    </div>
                    <div class="producto-detalles">
                        <h3>${item.nombre}</h3>
                        <p>Precio: $${item.precio.toLocaleString('es-CO')}</p>
                        <div class="cantidad-controles">
                            <button class="btn-cantidad" data-accion="disminuir" data-index="${index}">-</button>
                            <span class="cantidad-valor">${item.cantidad}</span>
                            <button class="btn-cantidad" data-accion="aumentar" data-index="${index}">+</button>
                        </div>
                        <p class="subtotal">Subtotal: $${subtotal.toLocaleString('es-CO')}</p>
                    </div>
                </div>
                <button class="btn-eliminar" data-index="${index}">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            `;
            carritoContenido.appendChild(productoElement);
        });

        const totalElement = document.createElement('div');
        totalElement.classList.add('carrito-total');
        totalElement.innerHTML = `
            <h3>Total del Carrito</h3>
            <p>$${totalGeneral.toLocaleString('es-CO')}</p>
            <button class="btn-pagar">Proceder al Pago</button>
        `;
        carritoContenido.appendChild(totalElement);
    }

    
    const cantidadButtons = document.querySelectorAll('.btn-cantidad');
    cantidadButtons.forEach(button => {
        button.addEventListener('click', manejarCambioCantidad);
 
       });
    const eliminarButtons = document.querySelectorAll('.btn-eliminar');
    eliminarButtons.forEach(button => {
        button.addEventListener('click', eliminarProducto);
    });   
}
function eliminarProducto(event) {
    const index = event.target.dataset.index;
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    carrito.splice(index, 1);  

    localStorage.setItem('carrito', JSON.stringify(carrito));  
    mostrarCarrito();  // Vuelve a mostrar el carrito actualizado
}

function manejarCambioCantidad(event) {
    const accion = event.target.dataset.accion;
    const index = event.target.dataset.index;

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (accion === 'aumentar') {
        carrito[index].cantidad += 1;
    } else if (accion === 'disminuir' && carrito[index].cantidad > 1) {
        carrito[index].cantidad -= 1;
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito(); 
}

function vaciarCarrito() {
    localStorage.removeItem('carrito'); 
    mostrarCarrito(); 
}


document.getElementById('vaciar-carrito').addEventListener('click', vaciarCarrito);


document.getElementById('volver-pagina-principal').addEventListener('click', function() {
    window.location.href = '/'; 
});

mostrarCarrito();


// Función para agregar productos al carrito
function agregarAlCarrito(event) {
    event.preventDefault();
    const boton = event.target;
    const card = boton.closest('.producto-card');
    const nombre = card.querySelector('h3').innerText;
    const precioElem = card.querySelector('.precio');
    const precio = precioElem ? parseFloat(precioElem.innerText.replace(/[^0-9.]/g, '')) : 0;
    const imagen = card.querySelector('img').src;

    if (!precioElem) {
        alert('Este producto aún no está disponible.');
        return;
    }

    const producto = {
        nombre,
        precio,
        imagen,
        cantidad: 1
    };

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productoExistente = carrito.find(item => item.nombre === producto.nombre);

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push(producto);
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`${nombre} ha sido agregado al carrito.`);
    window.location.href = '/ver_carrito';
}

// Asegurarse de que los event listeners se agreguen cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    const botonesAgregar = document.querySelectorAll('.agregar-carrito');
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', agregarAlCarrito);
    });
});

// Función para actualizar la visualización del carrito
function actualizarCarrito() {
    const contenedorCarrito = document.getElementById('carrito-contenido');
    const totalElement = document.getElementById('total');
    
    if (!contenedorCarrito) return;

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let contenidoHTML = '';
    let total = 0;

    carrito.forEach(producto => {
        total += producto.precio * producto.cantidad;
        contenidoHTML += `
            <div class="cart-item">
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <div class="item-details">
                    <h3>${producto.nombre}</h3>
                    <p class="item-price">$${producto.precio}</p>
                    <div class="quantity-controls">
                        <button onclick="cambiarCantidad('${producto.nombre}', -1)">-</button>
                        <span>${producto.cantidad}</span>
                        <button onclick="cambiarCantidad('${producto.nombre}', 1)">+</button>
                    </div>
                </div>
            </div>
        `;
    });

    if (contenedorCarrito) {
        contenedorCarrito.innerHTML = contenidoHTML || '<p>El carrito está vacío</p>';
    }
    if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)}`;
    }
}

// Función para cambiar la cantidad de un producto
function cambiarCantidad(nombreProducto, cambio) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const producto = carrito.find(item => item.nombre === nombreProducto);
    
    if (producto) {
        producto.cantidad += cambio;
        if (producto.cantidad <= 0) {
            carrito = carrito.filter(item => item.nombre !== nombreProducto);
        }
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarCarrito();
    }
}

// Función para vaciar el carrito
function vaciarCarrito() {
    localStorage.removeItem('carrito');
    actualizarCarrito();
}

// Agregar event listeners cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Event listener para los botones de agregar al carrito
    const botonesAgregar = document.querySelectorAll('.agregar-carrito');
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', agregarAlCarrito);
    });

    // Event listener para el botón de vaciar carrito
    const botonVaciar = document.getElementById('vaciar-carrito');
    if (botonVaciar) {
        botonVaciar.addEventListener('click', vaciarCarrito);
    }

    // Actualizar el carrito al cargar la página
    actualizarCarrito();
});