const prisma = require('../../../config/prisma').default;

class ProductService {
  async validateProductData(data, isAuction = false) {
    const requiredFields = ['name', 'description', 'price', 'sellerId', 'category'];
    
    if (isAuction) {
      requiredFields.push('startDate', 'endDate', 'startingBid', 'minBidIncrement');
    }

    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  async createProduct(data) {
    await this.validateProductData(data, data.isAuction);

    const productData = {
      ...data,
      status: data.status || 'DRAFT',
      stock: data.stock || 0,
      images: data.images || [],
      video: data.video || null
    };

    return await prisma.product.create({
      data: productData
    });
  }

  async updateProduct(id, data) {
    const updateData = {};
    
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    });

    return await prisma.product.update({
      where: { id },
      data: updateData
    });
  }

  async getProduct(id) {
    return await prisma.product.findUnique({
      where: { id }
    });
  }

  async getProducts(filters) {
    return await prisma.product.findMany({
      where: filters
    });
  }

  async deleteProduct(id) {
    return await prisma.product.delete({
      where: { id }
    });
  }

  async updateProductStatus(id, status) {
    return await prisma.product.update({
      where: { id },
      data: { status }
    });
  }

  async updateStock(id, stock) {
    return await prisma.product.update({
      where: { id },
      data: { stock }
    });
  }
}

module.exports = new ProductService(); 