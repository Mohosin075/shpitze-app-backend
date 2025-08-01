type IFolderName = 'images' | 'medias' | 'docs';

const getFilePath = (files: any, folderName: IFolderName) => {
  if (files && files.image[0].fieldname in files && files.image[0]) {
    return `/${folderName}/${files.image[0].filename}`;
  }
  return null;
};

export default getFilePath;
