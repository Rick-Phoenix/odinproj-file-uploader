import { PrismaClient } from "@prisma/client";
import { name } from "ejs";

const prisma = new PrismaClient();

export async function createUser(user) {
  await prisma.user.create({
    data: {
      ...user,
    },
  });
}

export async function getUsers() {
  const users = await prisma.user.findMany({
    include: {
      folders: true,
    },
  });
  console.log(users);
}

export async function getUser(email) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  return user;
}

export async function getUserFiles(email) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },

    include: {
      folders: true,
    },
  });

  return user;
}

export async function createFolder(userId, folderName, parentFolder) {
  await prisma.folder.create({
    data: {
      name: folderName,
      userId: userId,
      ...(parentFolder !== undefined && {
        parent: { connect: { name: parentFolder } },
      }),
    },
  });
}

export async function findFolder(userId, folderName, parentFolder) {
  const folder = await prisma.folder.findFirst({
    where: {
      userId: userId,
      name: folderName,
      ...(parentFolder !== undefined && {
        parent: { connect: { name: parentFolder } },
      }),
    },
  });

  return folder;
}
