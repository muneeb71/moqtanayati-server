const prisma = require('../../../config/prisma').default;

class CartService {
  async getCart(userId) {
    let cart = await prisma.cart.findFirst({ where: { userId }, include: { items: { include: { product: true } } } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }
    return cart;
  }

  async addOrUpdateItem(userId, { productId, quantity, price }) {
    let cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }
    const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } });
    if (existing) {
      return prisma.cartItem.update({ where: { id: existing.id }, data: { quantity, price } });
    } else {
      return prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity, price } });
    }
  }

  async removeItem(userId, itemId) {
    let cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) throw new Error('Cart not found');
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, id: itemId } });
  }
}

module.exports = new CartService(); 