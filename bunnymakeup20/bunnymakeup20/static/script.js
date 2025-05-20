// Asegurarnos de que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Función para agregar un producto al carrito
    function agregarAlCarrito(producto, precio, imagen) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const productoExistente = carrito.find(item => item.nombre === producto);

        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            carrito.push({ nombre: producto, cantidad: 1, precio: parseFloat(precio), imagen: imagen });
            alert(`${producto} ha sido agregado al carrito.`);
        }
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    // Botones de comprar en el slider principal
    const botonesComprar = document.querySelectorAll('.btn-1.comprar');
    botonesComprar.forEach(boton => {
        boton.addEventListener('click', (event) => {
            event.preventDefault();
            const producto = boton.getAttribute('data-producto');
            const precio = boton.getAttribute('data-precio');
            const imagen = boton.getAttribute('data-imagen');
            agregarAlCarrito(producto, precio, imagen);
            window.location.href = '/ver_carrito';
        });
    });

    // Botón agregar al carrito en la sección de productos destacados
    const botonesAgregarCarrito = document.querySelectorAll('.agregar-carrito');
    botonesAgregarCarrito.forEach(boton => {
        boton.addEventListener('click', (event) => {
            event.preventDefault();
            const producto = boton.getAttribute('data-producto');
            const precio = boton.getAttribute('data-precio');
            const imagen = boton.getAttribute('data-imagen');
            agregarAlCarrito(producto, precio, imagen);
        });
    });
});

var swiper = new Swiper(".mySwiper-1", {
    sliderPerView:1,
    spaceBetween: 30,
    loop:true,
    pagination: {
        el:".swiper-pagination",
        clickable: true,
    },
    navigation: {
        nextEl:".swiper-button-next",
        prevEl:".swiper-button-prev",
    }
});

var swiper = new Swiper(".mySwiper-2", {
    sliderPerView:3,
    spaceBetween: 20,
    loop:true,
    loopFillGroupWithBlank:true,
    navigation: {
        nextEl:".swiper-button-next",
        prevEl:".swiper-button-prev",
    },
    breakpoints : {
        0: {
            sliderPerView:1,
        },
        520: {
            sliderPerView:2,
        },
        950: {
            sliderPerView:3,
        }
    }
});

let tabInpunts = document.querySelectorAll(".tabInput");

tabInpunts.forEach(function(input) {
    input.addEventListener('change', function() {
        let id = input.ariaValueMax;
        let thisSwiper = document.getElementById('swiper' + id);
        thisSwiper.swiper.update();
    })
});

// Tabs para mostrar solo la sección activa
document.addEventListener('DOMContentLoaded', function() {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabSections = document.querySelectorAll('.tab-section');

    tabLinks.forEach((tab, idx) => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            // Quitar clase activa de todas las pestañas
            tabLinks.forEach(t => t.classList.remove('active'));
            // Agregar clase activa a la pestaña seleccionada
            tab.classList.add('active');
            // Ocultar todas las secciones
            tabSections.forEach(s => s.style.display = 'none');
            // Mostrar la sección correspondiente
            if (idx === 0) {
                document.getElementById('section-labiales').style.display = 'flex';
            } else if (idx === 1) {
                document.getElementById('section-skincare').style.display = 'flex';
            } else if (idx === 2) {
                document.getElementById('section-paletas').style.display = 'flex';
            }
        });
    });

    // Mostrar solo la primera sección al cargar
    document.getElementById('section-labiales').style.display = 'flex';
    document.getElementById('section-skincare').style.display = 'none';
    document.getElementById('section-paletas').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', function() {
    const dropdownLinks = document.querySelectorAll('.dropdown-content a');
    
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('href').substring(1);
            const tab = document.getElementById(tabId);
            if (tab) {
                tab.checked = true;
                // Scroll suave hasta la sección de productos
                document.querySelector('.tabs').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// Modal Más info
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.mas-info').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const titulo = btn.getAttribute('data-titulo');
            const desc = btn.getAttribute('data-desc');
            const img = btn.getAttribute('data-img');
            let extra = "";

            // Información extra según el producto
            if (titulo.toUpperCase().includes("HUDA")) {
                extra = "<b>Detalles:</b> Paleta de 18 tonos ultra pigmentados, acabados mate y metálicos. <br><b>Marca:</b> Huda Beauty.<br><b>Ideal para:</b> looks intensos y duraderos.<br><b>Tip:</b> Aplica los tonos metálicos con el dedo para mayor intensidad.";
            } else if (titulo.toUpperCase().includes("NIVEA")) {
                extra = "<b>Detalles:</b> Bálsamo labial con extracto de cereza y vitamina E.<br><b>Marca:</b> Nivea.<br><b>Beneficio:</b> Hidratación profunda y color suave.<br><b>Tip:</b> Úsalo varias veces al día para labios suaves.";
            } else if (titulo.toUpperCase().includes("VINYL MAYBELLINE")) {
                extra = "<b>Detalles:</b> Labial líquido de acabado vinilo, larga duración.<br><b>Marca:</b> Maybelline.<br><b>Resistente:</b> Hasta 16 horas.<br><b>Tip:</b> Aplica una sola capa y deja secar.";
            }
            document.getElementById('modal-info-title').textContent = titulo;
            document.getElementById('modal-info-desc').innerHTML = desc + "<br><br>" + extra;
            const modalImg = document.getElementById('modal-info-img');
            modalImg.src = img;
            document.getElementById('modal-info').style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });

    document.getElementById('close-info').addEventListener('click', function() {
        document.getElementById('modal-info').style.display = 'none';
        document.body.style.overflow = '';
    });

    // Efecto lupa en la imagen del modal
    const modalImg = document.getElementById('modal-info-img');
    if (modalImg) {
        modalImg.addEventListener('mousemove', function(e) {
            const rect = modalImg.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            modalImg.style.transformOrigin = `${x}% ${y}%`;
            modalImg.style.transform = 'scale(1.7)';
        });
        modalImg.addEventListener('mouseleave', function() {
            modalImg.style.transform = 'scale(1)';
            modalImg.style.transformOrigin = 'center center';
        });
    }
});

// Animación ripple para los botones del menú principal
document.querySelectorAll('.main-menu li a').forEach(link => {
    link.addEventListener('click', function(e) {
        // Elimina cualquier ripple anterior
        const oldRipple = this.querySelector('.ripple');
        if (oldRipple) oldRipple.remove();

        // Crea el span para el efecto
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        this.appendChild(ripple);

        // Calcula el tamaño y posición
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

        // Elimina el ripple después de la animación
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Selecciona los enlaces del menú principal
    const menuLinks = document.querySelectorAll('.main-menu li a');
    if (menuLinks.length >= 3) {
        // Botón Inicio
        menuLinks[0].addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        // Botón Servicios
        menuLinks[1].addEventListener('click', function(e) {
            e.preventDefault();
            alert('Ofrecemos productos de maquillaje nacional y coreano.');
        });
        // Botón Productos
        menuLinks[2].addEventListener('click', function(e) {
            e.preventDefault();
            const productosSection = document.querySelector('.tabs');
            if (productosSection) {
                productosSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});

// Búsqueda de productos
document.addEventListener('DOMContentLoaded', function() {
    const productos = {
        "HUMECTANTE DE LABIOS NIVEA (CEREZA)": "section-labiales",
        "LABIAL VINYL MAYBELLINE": "section-labiales",
        "LABIAL REVLON ULTRA HD": "section-labiales",
        "LOCIÓN HIDRATANTE CETAPHIL": "section-skincare",
        "KIT RHODE SKINCARE": "section-skincare",
        "SÉRUM GARNIER VITAMINA C": "section-skincare",
        "PALETA DE SOMBRAS APPLE": "section-paletas",
        "PALETA HUDA BEAUTY": "section-paletas",
        "PALETA NUDE MAYBELLINE": "section-paletas"
    };

    document.getElementById('search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const query = document.getElementById('search-bar').value.trim().toUpperCase();
        if (productos[query]) {
            // Cambia la pestaña activa si es necesario
            document.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
            if (productos[query] === "section-labiales") {
                document.getElementById('tab-labiales').classList.add('active');
            } else if (productos[query] === "section-skincare") {
                document.getElementById('tab-skincare').classList.add('active');
            } else if (productos[query] === "section-paletas") {
                document.getElementById('tab-paletas').classList.add('active');
            }
            // Oculta todas las secciones y muestra la correspondiente
            document.querySelectorAll('.tab-section').forEach(s => s.style.display = 'none');
            document.getElementById(productos[query]).style.display = 'flex';
            // Hace scroll suave a la sección de productos
            document.querySelector('.tabs').scrollIntoView({ behavior: 'smooth' });
        } else {
            alert("Producto no encontrado. Por favor, intenta con otra búsqueda.");
        }
    });
});

// Envío de formulario de reseñas
document.addEventListener('DOMContentLoaded', function() {
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(reviewForm);
            fetch('/guardar_resena', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                const msg = document.getElementById('review-message');
                if (data.success) {
                    msg.textContent = "¡Gracias por tu reseña!";
                    reviewForm.reset();
                } else {
                    msg.textContent = "Ocurrió un error. Intenta de nuevo.";
                }
            })
            .catch(() => {
                document.getElementById('review-message').textContent = "Ocurrió un error. Intenta de nuevo.";
            });
        });
    }
});
