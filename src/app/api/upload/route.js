import cloudinary from '@/lib/cloudinary';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// Route handler for POST requests
export async function POST(req) {
  try {
    const body = await req.json();
    const { file } = body;

    const uploadResponse = await cloudinary.uploader.upload(file, {
      folder: 'mookymook',
    });

    return Response.json({ url: uploadResponse.secure_url });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Upload failed', error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
