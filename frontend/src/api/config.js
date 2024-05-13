const ENVIRONMENT = process.env.NODE_ENV || 'development';

const config = {
    development: {
        API_URL: 'http://192.168.19.2:9999/api',
    },
    production: {
        API_URL: 'http://192.168.19.2:9999/api',
    },
}

export default config[ENVIRONMENT];