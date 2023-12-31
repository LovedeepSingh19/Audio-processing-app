import S3 from 'aws-sdk/clients/s3.js';


const CloudflareApi = async (audioUri, filename) => {

    const s3 = new S3({
      // eslint-disable-next-line no-undef
      endpoint: `https://${process.env.EXPO_PUBLIC_AWS_ACCOUNTS_ID_TEST}.r2.cloudflarestorage.com`,
      // eslint-disable-next-line no-undef
      accessKeyId: `${process.env.EXPO_PUBLIC_AWS_ACCESS_ID}`,
      // eslint-disable-next-line no-undef
      secretAccessKey: `${process.env.EXPO_PUBLIC_AWS_SECRET}`,
      signatureVersion: 'v4',
    });

    const data = await fetch(audioUri).then((response) => response.blob())

    const params = {
      // eslint-disable-next-line no-undef
      Bucket: process.env.EXPO_PUBLIC_AWS_BUCKET_NAME,
      Key: filename,
      Body: data,
      ContentType: "application/octet-stream",
    };
  
    try {
      const result = await s3.upload(params).promise();
      console.log('File uploaded successfully:', result.Key);
      return 'https://pub-990bb9dfb80f4b3a88526f0603591d56.r2.dev/'+result.Key;
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  };

export default CloudflareApi;