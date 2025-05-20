from app import app, db, Producto
import os

def populate_products():
    # Lista de productos iniciales
    productos = [
        {
            "nombre": "Labial Vinyl Maybelline",
            "descripcion": "Labial Vinyl de Maybelline, cuenta con una larga duración por más de 12 horas. No deja sensación de labios resecos y tiene un acabado terciopelado.",
            "precio": 15000,
            "imagen": "image/Labial.webp",
            "categoria": "Labiales",
            "stock": 50
        },
        {
            "nombre": "Paleta Huda Beauty",
            "descripcion": "Paleta de sombras Huda Beauty, cuenta con 15 tonos para crear looks perfectos, tienen buena pigmentación y su textura es cremosa.",
            "precio": 16000,
            "imagen": "image/sombras.webp",
            "categoria": "Paletas",
            "stock": 30
        },
        {
            "nombre": "Kit Rhode",
            "descripcion": "Kit de skincare de la marca Rhode que cuenta con cuatro productos: jabón facial, agua termal, protector solar y mascarilla.",
            "precio": 30000,
            "imagen": "image/kitRhode.png",
            "categoria": "Skincare",
            "stock": 20
        }
    ]

    # Agregar productos a la base de datos
    for producto in productos:
        nuevo_producto = Producto(**producto)
        db.session.add(nuevo_producto)
    
    db.session.commit()
    print("Productos agregados exitosamente!")

if __name__ == '__main__':
    with app.app_context():
        populate_products() 