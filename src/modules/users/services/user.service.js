const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserService {
  async getAllUsers() {
    return await prisma.user.findMany();
  }

  async getUserById(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');
    return user;
  }

  async editUser(id, data) {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return user;
  }

  async deleteUser(id) {
    await prisma.user.delete({ where: { id } });
  }
}

module.exports = new UserService(); 