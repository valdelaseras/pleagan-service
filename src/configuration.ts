export default () => ({
    develop: process.env.DEBUG || true,
    databaseLogging: process.env.DATABASE_LOGGING || false,
    database: {
        username: process.env.DATABASE_USER || 'pleagan',
        password: process.env.DATABASE_PASSWORD || 'pleagan',
        host: process.env.DATABASE_HOST || 'localhost',
        port: process.env.DATABASE_PORT || 3306,
        type: process.env.DATABASE_TYPE || 'mariadb',
        database: process.env.DATABASE_SCHEMA || 'pleagan',
    }
})
