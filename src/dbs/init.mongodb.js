const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

// const {
//     db: { host, port, name },
// } = require('../configs/config.mongodb');

//nd6K6idrswJYN4cd
// const connectString = `mongodb://${host}:${port}/${name}`
const connectString =
    'mongodb+srv://girllinh4:hrQdehoMFZc1abV8@cluster0.9gulfoc.mongodb.net/?retryWrites=true&w=majority';

console.log('connectString::', connectString);

const { countConnect } = require('../helpers/check.connect');

class Database {
    constructor() {
        this.connect();
    }

    connect(type = 'mongodb') {
        if (1 === 1) {
            mongoose.set('debug', true);
            mongoose.set('debug', { color: true });
        }
        mongoose
            .connect(connectString)
            .then((_) => {
                console.log('Connected success', countConnect());
            })
            .catch((err) => console.log(`Error Connect`));
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }

        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance();

module.exports = instanceMongodb;
