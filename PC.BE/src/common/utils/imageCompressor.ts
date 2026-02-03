import * as sharp from 'sharp';
import { Logger } from '@nestjs/common';
import { ImageCompression } from 'src/common/constants';

export const compressFromBase64 = (
  imageBuffer: Buffer,
  filetype?: string,
): Promise<Buffer> => {
  const logger = new Logger();
  const imgSharp = sharp(imageBuffer);
  const format =
    filetype === 'png'
      ? imgSharp.png({ quality: ImageCompression.defaultQuality })
      : imgSharp.webp({ quality: ImageCompression.defaultQuality });

  const image = format
    .toBuffer()
    .then((imgBuffer) => {
      const imgBase64 = imgBuffer.toString('base64');
      logger.log(`Compressed`);
      return Buffer.from(imgBase64, 'base64');
    })
    .catch((err) => {
      logger.log(`Error processing image: ${err}`);
      return Promise.reject(err);
    });

  if (filetype) return image;
};
