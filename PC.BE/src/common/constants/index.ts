import 'dotenv/config';

export const MONO_DB_CONNECTION_STRING =
  process.env.MONO_DB_CONNECTION_STRING_ENV;
// 'mongodb://lovsrvpweb03/bancosantacruz';
// 'mongodb://172.27.23.113/bancosantacruz';
// 'mongodb://srvdevpweb03/bancosantacruz';
// 'mongodb://127.0.0.1:27017/bancosantacruz';
// 'mongodb://#{ServerDB}#:27017/bancosantacruz';

export const jwtConstants = {
  secret:
    'Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live. (Martin Golding)',
};

// DEFAULT SLIDER OBJECT
export const defaultFeatureSlider = {
  features: {
    text: '',
    align: '',
    size: '',
    color: '',
    weight: '',
  },
  featuresButton: {
    enabled: false,
    link: '',
    text: '',
    align: '',
    size: '',
    color: '',
    weight: '',
    background: '',
  },
};

export const ImageCompression = {
  defaultFormat: 'webp',
  defaultQuality: 80,
};

const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

if (!containerName) {
  throw new Error(
    'AZURE_STORAGE_CONTAINER_NAME environment variable is missing',
  );
}

export const ASContainerName = containerName;
