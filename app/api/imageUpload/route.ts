import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary/cloudinary';
import { Writable } from 'stream';

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert the Blob to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the Buffer to Cloudinary using a stream
    const streamPromise = () =>
      new Promise((resolve, reject) => {
        const publicIdtest = `catch_${Date.now()}`;
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'KalaLog/catches',
            public_id: publicIdtest,
            transformation: [
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        const writableStream = new Writable({
          write(chunk, encoding, callback) {
            uploadStream.write(chunk, encoding, callback);
          },
          final(callback) {
            uploadStream.end(callback);
          },
        });

        writableStream.write(buffer);
        writableStream.end();
      });

    const result = await streamPromise();

    // Return the secure URL to the client
    return NextResponse.json({ url: (result as any).secure_url });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
};
