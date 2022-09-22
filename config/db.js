const mongoose = require('mongoose')

mongoose.Promise = global.Promise;

const DBconnection = async () => {
  const conn = await mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
      promiseLibrary: global.Promise
    })
    .catch(err => {
      console.log(`For some reasons we couldn't connect to the DB`.red, err)
    })


  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold)
  return conn
}

module.exports = DBconnection
