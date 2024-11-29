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

export async function createFolder(userId, folderName, parentId) {
  await prisma.folder.create({
    data: {
      name: folderName,
      userId: +userId,
      ...(parentId !== undefined && {
        parentId: +parentId,
      }),
    },
  });
}

export async function findFolder(userId, folderId) {
  const folder = await prisma.folder.findFirst({
    where: {
      userId: +userId,
      id: +folderId,
    },
  });

  return folder;
}

export async function deleteFolder(userId, folderId) {
  await prisma.folder.delete({
    where: {
      userId: userId,
      id: +folderId,
    },
  });
}
