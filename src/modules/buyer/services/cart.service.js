const prisma = require('../../../config/prisma');

class CartService {
  async getCart(userId) {
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                store: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        },
        user: true
      }
    });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }
    return cart;
  }

  async addOrUpdateItem(userId, { productId, quantity, price }) {
    try {  
      let cart = await prisma?.cart.findFirst({ where: { userId } });
  
      if (!cart) {
        console.log("No cart found, creating one...");
        cart = await prisma?.cart.create({ data: { userId } });
      }
  
      const existingItem = await prisma?.cartItem.findFirst({
        where: { cartId: cart.id, productId },
      });
  
      if (existingItem) {
        console.log("Item exists in cart, updating...");
        return await prisma?.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity, price },
        });
      } else {
        console.log("Item not in cart, creating new entry...");
        return await prisma?.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
            price,
          },
        });
      }
    } catch (error) {
      console.error("Error in addOrUpdateItem:", error);
      throw new Error("Could not add or update item in cart.");
    }
  }
  

  async removeItem(userId, itemId) {
    let cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) throw new Error('Cart not found');
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, id: itemId } });
  }

  async updateItem(userId, itemId, { quantity, price }) {
    let cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) throw new Error('Cart not found');
    const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new Error('Cart item not found');
    if (quantity <= 0) throw new Error('Quantity must be greater than 0');
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity, ...(price !== undefined ? { price } : {}) },
    });
  }
}

module.exports = new CartService(); 