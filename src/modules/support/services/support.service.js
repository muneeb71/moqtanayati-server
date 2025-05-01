const prisma = require('../../config/prisma').default;

class SupportService {
  async submitSupportRequest(data) {
    const requiredFields = ['name', 'email', 'category', 'description'];
    for (const field of requiredFields) {
      if (!data[field]) throw new Error(`Missing required field: ${field}`);
    }
    await prisma.supportRequest.create({
      data: {
        name: data.name,
        email: data.email,
        category: data.category,
        description: data.description,
        attachment: data.attachment || null,
      },
    });
  }
}

module.exports = new SupportService(); 