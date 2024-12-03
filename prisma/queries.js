import { PrismaClient } from "@prisma/client";

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
  console.log(parentId);
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
    include: {
      files: true,
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

export async function renameFolder(userId, folderId, newName) {
  await prisma.folder.update({
    data: {
      name: newName,
    },

    where: {
      userId: +userId,
      id: +folderId,
    },
  });
}

export async function addFile(fileData) {
  const newFile = await prisma.file.create({
    data: {
      ...fileData,
    },
  });

  console.log("Entry DB: ", newFile);
}

export async function getFileById(id) {
  const file = await prisma.file.findUnique({
    where: {
      id: id,
    },
  });

  return file;
}

export async function deleteFile(id) {
  await prisma.file.delete({
    where: {
      id: id,
    },
  });
}
