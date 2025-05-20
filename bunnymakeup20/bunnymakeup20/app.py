from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import os
from flask_migrate import Migrate

# Obtener la ruta base del proyecto
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SECRET_KEY'] = 'tu_clave_secreta_aqui'  # Cambia esto por una clave segura
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///usuarios.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth'
migrate = Migrate(app, db)

# Definir la tabla de usuarios
class Usuario(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    correo = db.Column(db.String(120), unique=True, nullable=False)
    usuario = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    pedidos = db.relationship('Pedido', backref='usuario', lazy=True)
    carrito = db.relationship('CarritoItem', backref='usuario', lazy=True)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

# Definir la tabla de productos
class Producto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    precio = db.Column(db.Float, nullable=False)
    imagen = db.Column(db.String(200))
    categoria = db.Column(db.String(50))
    stock = db.Column(db.Integer, default=0)
    pedidos = db.relationship('DetallePedido', backref='producto', lazy=True)

# Definir la tabla del carrito
class CarritoItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    cantidad = db.Column(db.Integer, default=1)
    producto = db.relationship('Producto')

# Definir la tabla de pedidos
class Pedido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    fecha = db.Column(db.DateTime, default=db.func.current_timestamp())
    total = db.Column(db.Float, nullable=False)
    estado = db.Column(db.String(20), default='pendiente')
    detalles = db.relationship('DetallePedido', backref='pedido', lazy=True)

# Definir la tabla de detalles de pedido
class DetallePedido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedido.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Float, nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(int(user_id))

@app.route('/')
def index():
    return render_template('index.html', usuario_actual=current_user)

@app.route('/auth', methods=['GET', 'POST'])
def auth():
    if request.method == 'POST':
        if 'registro' in request.form:
            # Procesar registro
            nombre = request.form['reg-nombre']
            correo = request.form['reg-correo']
            usuario = request.form['reg-usuario']
            password = request.form['reg-password']
            password2 = request.form['reg-password2']

            if password != password2:
                flash('Las contraseñas no coinciden', 'error')
                return redirect(url_for('auth'))

            if Usuario.query.filter_by(usuario=usuario).first():
                flash('El nombre de usuario ya existe', 'error')
                return redirect(url_for('auth'))

            if Usuario.query.filter_by(correo=correo).first():
                flash('El correo ya está registrado', 'error')
                return redirect(url_for('auth'))

            nuevo_usuario = Usuario(
                nombre=nombre,
                correo=correo,
                usuario=usuario,
            )
            nuevo_usuario.set_password(password)
            db.session.add(nuevo_usuario)
            db.session.commit()
            flash('Registro exitoso. Ahora puedes iniciar sesión.', 'success')
            return redirect(url_for('auth'))

        elif 'login' in request.form:
            # Procesar inicio de sesión
            usuario = request.form['login-user']
            password = request.form['login-password']

            # Buscar por usuario o correo
            user = Usuario.query.filter((Usuario.usuario == usuario) | (Usuario.correo == usuario)).first()

            if user and check_password_hash(user.password, password):
                login_user(user)
                return redirect(url_for('index'))
            else:
                flash('Usuario o contraseña incorrectos', 'error')
                return redirect(url_for('auth'))

    return render_template('auth.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

# CRUD Usuarios

@app.route('/usuarios', methods=['GET'])
def obtener_usuarios():
    usuarios = Usuario.query.all()
    return jsonify([{
        "id": u.id,
        "nombre": u.nombre,
        "correo": u.correo,
        "usuario": u.usuario
    } for u in usuarios])

@app.route('/usuarios/<int:id>', methods=['GET'])
def obtener_usuario(id):
    usuario = Usuario.query.get(id)
    if usuario is None:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify({
        "id": usuario.id,
        "nombre": usuario.nombre,
        "correo": usuario.correo,
        "usuario": usuario.usuario
    })

@app.route('/usuarios', methods=['POST'])
def crear_usuario():
    datos = request.get_json()
    if not datos or not 'nombre' in datos or not 'correo' in datos or not 'password' in datos or not 'usuario' in datos:
        return jsonify({"error": "Faltan datos obligatorios"}), 400
    
    if Usuario.query.filter_by(usuario=datos['usuario']).first():
        return jsonify({"error": "El nombre de usuario ya existe"}), 400

    if Usuario.query.filter_by(correo=datos['correo']).first():
        return jsonify({"error": "El correo ya está registrado"}), 400
    
    nuevo_usuario = Usuario(
        nombre=datos['nombre'],
        correo=datos['correo'],
        usuario=datos['usuario']
    )
    nuevo_usuario.set_password(datos['password'])

    db.session.add(nuevo_usuario)
    db.session.commit()

    return jsonify({"mensaje": "Usuario creado correctamente", "usuario_id": nuevo_usuario.id}), 201

@app.route('/usuarios/<int:id>', methods=['PUT'])
def actualizar_usuario(id):
    usuario = Usuario.query.get(id)
    if usuario is None:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    datos = request.get_json()
    if 'nombre' in datos:
        usuario.nombre = datos['nombre']
    if 'correo' in datos:
        if Usuario.query.filter(Usuario.correo == datos['correo'], Usuario.id != id).first():
            return jsonify({"error": "Correo ya registrado por otro usuario"}), 400
        usuario.correo = datos['correo']
    if 'usuario' in datos:
        if Usuario.query.filter(Usuario.usuario == datos['usuario'], Usuario.id != id).first():
            return jsonify({"error": "Nombre de usuario ya existe"}), 400
        usuario.usuario = datos['usuario']
    if 'password' in datos:
        usuario.set_password(datos['password'])

    db.session.commit()
    return jsonify({"mensaje": "Usuario actualizado correctamente"})

@app.route('/usuarios/<int:id>', methods=['DELETE'])
def eliminar_usuario(id):
    usuario = Usuario.query.get(id)
    if usuario is None:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    db.session.delete(usuario)
    db.session.commit()
    return jsonify({"mensaje": "Usuario eliminado correctamente"})

# CRUD Productos

@app.route('/productos', methods=['GET'])
def obtener_productos():
    productos = Producto.query.all()
    return jsonify([{
        "id": p.id,
        "nombre": p.nombre,
        "descripcion": p.descripcion,
        "precio": p.precio,
        "imagen": p.imagen,
        "categoria": p.categoria,
        "stock": p.stock
    } for p in productos])

@app.route('/productos/<int:id>', methods=['GET'])
def obtener_producto(id):
    producto = Producto.query.get(id)
    if producto is None:
        return jsonify({"error": "Producto no encontrado"}), 404
    return jsonify({
        "id": producto.id,
        "nombre": producto.nombre,
        "descripcion": producto.descripcion,
        "precio": producto.precio,
        "imagen": producto.imagen,
        "categoria": producto.categoria,
        "stock": producto.stock
    })

@app.route('/productos', methods=['POST'])
def crear_producto():
    datos = request.get_json()
    if not datos or not 'nombre' in datos or not 'precio' in datos:
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    nuevo_producto = Producto(
        nombre=datos['nombre'],
        descripcion=datos.get('descripcion', ''),
        precio=datos['precio'],
        imagen=datos.get('imagen', ''),
        categoria=datos.get('categoria', ''),
        stock=datos.get('stock', 0)
    )
    db.session.add(nuevo_producto)
    db.session.commit()

    return jsonify({"mensaje": "Producto creado correctamente", "producto_id": nuevo_producto.id}), 201

@app.route('/productos/<int:id>', methods=['PUT'])
def actualizar_producto(id):
    producto = Producto.query.get(id)
    if producto is None:
        return jsonify({"error": "Producto no encontrado"}), 404

    datos = request.get_json()
    if 'nombre' in datos:
        producto.nombre = datos['nombre']
    if 'descripcion' in datos:
        producto.descripcion = datos['descripcion']
    if 'precio' in datos:
        producto.precio = datos['precio']
    if 'imagen' in datos:
        producto.imagen = datos['imagen']
    if 'categoria' in datos:
        producto.categoria = datos['categoria']
    if 'stock' in datos:
        producto.stock = datos['stock']

    db.session.commit()
    return jsonify({"mensaje": "Producto actualizado correctamente"})

@app.route('/productos/<int:id>', methods=['DELETE'])
def eliminar_producto(id):
    producto = Producto.query.get(id)
    if producto is None:
        return jsonify({"error": "Producto no encontrado"}), 404

    db.session.delete(producto)
    db.session.commit()
    return jsonify({"mensaje": "Producto eliminado correctamente"})

# CRUD Carrito

@app.route('/ver_carrito')
@login_required
def ver_carrito():
    carrito = CarritoItem.query.filter_by(usuario_id=current_user.id).all()
    total = sum(item.cantidad * item.producto.precio for item in carrito)
    return render_template('carrito.html', carrito=carrito, total=total, usuario_actual=current_user)

@app.route('/agregar_al_carrito', methods=['POST'])
@login_required
def agregar_al_carrito():
    datos = request.get_json()
    if not datos or 'producto_id' not in datos or 'cantidad' not in datos:
        return jsonify({"error": "Faltan datos obligatorios"}), 400
    
    item = CarritoItem.query.filter_by(
        usuario_id=current_user.id,
        producto_id=datos['producto_id']
    ).first()
    
    if item:
        item.cantidad += datos['cantidad']
    else:
        item = CarritoItem(
            usuario_id=current_user.id,
            producto_id=datos['producto_id'],
            cantidad=datos['cantidad']
        )
        db.session.add(item)
    
    db.session.commit()
    return jsonify({"mensaje": "Producto agregado al carrito"})

@app.route('/actualizar_carrito', methods=['POST'])
@login_required
def actualizar_carrito():
    datos = request.get_json()
    item = CarritoItem.query.get(datos.get('item_id'))
    
    if item and item.usuario_id == current_user.id:
        nueva_cantidad = item.cantidad + datos.get('cambio', 0)
        if nueva_cantidad > 0:
            item.cantidad = nueva_cantidad
            db.session.commit()
            return jsonify({"success": True})
        elif nueva_cantidad == 0:
            db.session.delete(item)
            db.session.commit()
            return jsonify({"success": True})
    
    return jsonify({"error": "No se pudo actualizar el carrito"}), 400

@app.route('/eliminar_del_carrito', methods=['POST'])
@login_required
def eliminar_del_carrito():
    datos = request.get_json()
    item = CarritoItem.query.get(datos.get('item_id'))
    
    if item and item.usuario_id == current_user.id:
        db.session.delete(item)
        db.session.commit()
        return jsonify({"success": True})
    
    return jsonify({"error": "No se pudo eliminar el item"}), 400

# CRUD Pedidos

@app.route('/pedidos', methods=['GET'])
@login_required
def obtener_pedidos():
    pedidos = Pedido.query.filter_by(usuario_id=current_user.id).all()
    resultado = []
    for pedido in pedidos:
        detalles = [{
            "producto_id": detalle.producto_id,
            "cantidad": detalle.cantidad,
            "precio_unitario": detalle.precio_unitario,
            "nombre_producto": detalle.producto.nombre
        } for detalle in pedido.detalles]
        resultado.append({
            "pedido_id": pedido.id,
            "fecha": pedido.fecha,
            "total": pedido.total,
            "estado": pedido.estado,
            "detalles": detalles
        })
    return jsonify(resultado)

@app.route('/crear_pedido', methods=['POST'])
@login_required
def crear_pedido():
    datos = request.get_json()
    if not datos or 'total' not in datos or 'detalles' not in datos:
        return jsonify({"error": "Faltan datos obligatorios"}), 400
    
    nuevo_pedido = Pedido(
        usuario_id=current_user.id,
        total=datos['total']
    )
    db.session.add(nuevo_pedido)
    db.session.flush()  # Para obtener el id del pedido antes de commit
    
    for detalle in datos['detalles']:
        nuevo_detalle = DetallePedido(
            pedido_id=nuevo_pedido.id,
            producto_id=detalle['producto_id'],
            cantidad=detalle['cantidad'],
            precio_unitario=detalle['precio_unitario']
        )
        db.session.add(nuevo_detalle)
    
    db.session.commit()
    return jsonify({"mensaje": "Pedido creado correctamente", "pedido_id": nuevo_pedido.id})
# ... existing code ...

# Modelo para reseñas
class Resena(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    comentario = db.Column(db.Text, nullable=False)
    calificacion = db.Column(db.Integer, nullable=False)

from flask import request, jsonify

@app.route('/guardar_resena', methods=['POST'])
def guardar_resena():
    nombre = request.form.get('nombre')
    comentario = request.form.get('comentario')
    calificacion = request.form.get('calificacion')
    if not nombre or not comentario or not calificacion:
        return jsonify({'success': False, 'error': 'Faltan datos'}), 400
    try:
        nueva_resena = Resena(
            nombre=nombre,
            comentario=comentario,
            calificacion=int(calificacion)
        )
        db.session.add(nueva_resena)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ... existing code ...
if __name__ == '__main__':
    with app.app_context():
        try:
            # Crear las tablas si no existen
            db.create_all()
            print("Base de datos inicializada correctamente")
        except Exception as e:
            print(f"Error al inicializar la base de datos: {e}")
    app.run(debug=True)
